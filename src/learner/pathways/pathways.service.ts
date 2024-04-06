import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  AddPathwayDto,
  AddPathwaysClusterDto,
  AddPathwaysLevelDto,
  CreatePathwayApproval,
  CreatePathwayDto,
  SearchCLusterPathwayDto,
  SearchPathwayApprovals,
  SearchPathwayDto,
  SearchPathwayRequests,
} from "./dto/create-pathway.dto";
import {
  UpdatePathwayDto,
  UpdatePathwaysLevelDto,
} from "./dto/update-pathway.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CommonFunctionsService } from "src/services/commonService";
import cluster from "cluster";

@Injectable()
export class PathwaysService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService
  ) { }
  async create(dto: CreatePathwayDto, response: Response) {
    try {
      let isPathwayExits = await this.prisma.pathways.findFirst({
        where: {
          name: dto.name,
        },
      });
      if (isPathwayExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Pathway already Exist!!");
      }

      let PathwayCreated = await this.prisma.pathways.create({
        data: {
          name: dto.name,
          description: dto.description,
          instructor_id: dto.instructor_id,
          organization_id: dto.organization_id,
          is_active: true,
        },
      });
      if (PathwayCreated) {
        let PahwayLevel = await this.prisma.pathway_levels.create({
          data: {
            certification_level_id: dto.certification_level_id,
            pathway_id: PathwayCreated.id,
          },
        });

        let PathwaylevelCourses = await this.prisma.pathway_badges.create({
          data: {
            pathway_id: PathwayCreated.id,
            pathway_level_id: PahwayLevel.id,
            badge_id: dto.badge_id,
          },
        });
      }
      if (PathwayCreated) {
        return response.status(HttpStatus.OK).json(PathwayCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async addPathway(dto: AddPathwayDto, response: Response) {
    try {
      let isPathwayExits = await this.prisma.pathways.findFirst({
        where: {
          name: dto.name,
          instructor_id: dto.instructor_id ?? undefined,
          organization_id: dto.organization_id ?? undefined,
        },
      });

      if (isPathwayExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Pathway already Exist!!");
      }

      let addpathways = await this.prisma.pathways.create({
        data: {
          name: dto.name,
          description: dto.description,
          organization_id: dto.organization_id,
          instructor_id: dto.instructor_id,
          is_active: true,
        },
      });

      let addClusters = await this.prisma.cluster_pathways.create({
        data: {
          pathway_id: addpathways.id,
          cluster_id: dto.cluster_id,
          is_active: true,
        },
      });

      if (addpathways) {
        return response
          .status(HttpStatus.OK)
          .json({ data: addpathways });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async addLevel(dto: AddPathwaysLevelDto, response: Response) {
    try {
      let levels = dto.levels;
      let isPathwayExits = await this.prisma.pathways.findFirst({
        where: {
          id: dto.pathway_id,
        },
      });
      if (isPathwayExits) {
        for (let item of levels) {
          let addLevels = await this.prisma.pathway_levels.create({
            data: {
              pathway_id: dto.pathway_id,
              certification_level_id: item.certification_id,
            },
          });
          let badgeArray = [];
          let Badges = item.badges;
          for (let id of Badges) {
            badgeArray.push(id);
          }

          for (let value of badgeArray) {
            let addBadges = await this.prisma.pathway_badges.create({
              data: {
                pathway_level_id: addLevels.id,
                pathway_id: dto.pathway_id,
                badge_id: value,
              },
            });
          }
        }
      }

      return response
        .status(HttpStatus.OK)
        .json({ message: "Pathway Levels Added Successfully" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async addPathwayCluster(dto: AddPathwaysClusterDto, response: Response) {
    try {
      let addClusters = await this.prisma.cluster_pathways.create({
        data: {
          pathway_id: dto.pathway_id,
          cluster_id: dto.cluster_id,
        },
      });
      if (addClusters) {
        return response
          .status(HttpStatus.OK)
          .json({ message: "Pathway Successfully Mapped with CLuster " });
      } else {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Not Successfull" });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response, query: SearchPathwayDto) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let user = await this.prisma.users.findUnique({
        where: {
          id: query.instructor_id,
        },
      });
      let pathwayCount = await this.prisma.pathways.count({
        where: {
          name: {
            contains: query.searchByText ?? undefined,
          },
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instructor_id,
          is_active: true,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      let isPathwayFound: any = await this.prisma.pathways.findMany({
        where: {
          name: {
            contains: query.searchByText ?? undefined,
          },
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instructor_id,
          is_active: true,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      for (let item of isPathwayFound) {
        item.completion = "50%";
      }

      if (isPathwayFound) {
        return response.status(HttpStatus.OK).json({
          total: pathwayCount,
          limit: limit,
          offset: pageNo,
          data: isPathwayFound,
        });
      } else {
        throw new HttpException("Pathway Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async findAllCLusterPathways(
    response: Response,
    query: SearchCLusterPathwayDto
  ) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let pathwayCount = await this.prisma.cluster_pathways.count({
        where: {
          cluster_id: query.cluster_id ?? undefined,
          is_active: true,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      let isPathwayFound: any = await this.prisma.cluster_pathways.findMany({
        where: {
          cluster_id: query.cluster_id ?? undefined,
          is_active: true,
        },
        skip: pageNo * limit,
        take: query?.limit,
        include: {
          clusters: {
            include: {
              colors: true,
            },
          },
          pathways: {
            include: {
              pathway_levels: {
                include: {
                  pathway_badges: {
                    include: {
                      badges: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (let item of isPathwayFound) {
        item.pathways.completion = 50;
      }

      if (isPathwayFound) {
        return response.status(HttpStatus.OK).json({
          total: pathwayCount,
          limit: limit,
          offset: pageNo,
          data: isPathwayFound,
        });
      } else {
        throw new HttpException("Pathway Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let PathwayFound: any = await this.prisma.pathways.findUnique({
        where: {
          id: id,
        },
        include: {
          cluster_pathways: {
            select: {
              clusters: {
                select: {
                  colors: true,
                },
              },
            },
          },
          pathway_levels: {
            include: {
              certification_levels: true,
              pathway_badges: {
                include: {
                  badges: true,
                },
              },
            },
          },
        },
      });

      if (PathwayFound) {
        for (let item of PathwayFound.pathway_levels) {
          for (let value of item.pathway_badges) {
            let attachments = await this.serviceFunction.getAttachments(
              value.badge_id,
              "BadgeImage"
            );
            value.attachments = attachments;
          }
        }
        PathwayFound.completion = "50%";
        return response.status(HttpStatus.OK).json(PathwayFound);
      } else {
        throw new HttpException("Pathway Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updatePathways(id: number, dto: UpdatePathwayDto, response: Response) {
    try {
      let isPathwayExists = await this.prisma.pathways.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          instructor_id: true,
          organization_id: true,
          cluster_pathways: {
            select: {
              cluster_id: true,
              pathway_id: true,
            },
          },
        },
      });
      let updatePathways = await this.prisma.pathways.update({
        where: {
          id: isPathwayExists.id,
        },
        data: {
          name: dto.name ?? isPathwayExists.name,
          description: dto.description ?? isPathwayExists.description,
          instructor_id: dto.instructor_id ?? isPathwayExists.instructor_id,
          organization_id:
            dto.organization_id ?? isPathwayExists.organization_id,
        },
      });
      if (dto.cluster_id) {
        let deletefindClusterPathways = this.prisma.cluster_pathways.deleteMany(
          {
            where: {
              pathway_id: isPathwayExists.id,
            },
          }
        );

        let addPatwhaysClusters = await this.prisma.cluster_pathways.create({
          data: {
            pathway_id: isPathwayExists.id,
            cluster_id: dto.cluster_id,
          },
        });
      }
      return response.status(HttpStatus.OK).json(updatePathways);
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateLevels(
    id: number,
    dto: UpdatePathwaysLevelDto,
    response: Response
  ) {
    try {
      let isPathwayExits = await this.prisma.pathways.findFirst({
        where: {
          id: id,
        },
      });
      if (isPathwayExits) {
        let deleteLevels = await this.prisma.pathway_levels.deleteMany({
          where: {
            pathway_id: id,
          },
        });
        let deleteBadges = await this.prisma.pathway_badges.deleteMany({
          where: {
            pathway_id: id,
          },
        });

        let levels = dto.levels;
        for (let item of levels) {
          let addLevels = await this.prisma.pathway_levels.create({
            data: {
              pathway_id: id,
              certification_level_id: item.certification_id,
            },
          });
          let badgeArray = [];
          let Badges = item.badges;
          for (let id of Badges) {
            badgeArray.push(id);
          }

          for (let value of badgeArray) {
            let addBadges = await this.prisma.pathway_badges.create({
              data: {
                pathway_level_id: addLevels.id,
                pathway_id: id,
                badge_id: value,
              },
            });
          }
        }

        return response
          .status(HttpStatus.OK)
          .json({ message: "Pathway Levels Updated Successfully" });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let pathwaysInactive = await this.prisma.pathways.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
        },
      });
      let clusterPatwhays = await this.prisma.cluster_pathways.findFirst({
        where: {
          pathway_id: id,
        },
      });

      let clusterPatwhaysInactive = await this.prisma.cluster_pathways.update({
        where: {
          id: clusterPatwhays.id,
        },
        data: {
          is_active: false,
        },
      });

      return response
        .status(HttpStatus.OK)
        .json({ message: "Pathway Deleted Successfully" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
