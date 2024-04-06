import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import {
  CreateClusterDto,
  SearchClusterDto,
  colordto,
  SearchInstructorClusterDto,
} from "./dto/create-cluster.dto";
import { UpdateClusterDto } from "./dto/update-cluster.dto";
import { Response, Request } from "express";
import { CommonFunctionsService } from "src/services/commonService";

@Injectable()
export class ClustersService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService
  ) { }
  async create(dto: CreateClusterDto, response: Response) {
    try {
      let isClusterExits = await this.prisma.clusters.findFirst({
        where: {
          title: dto.title,
          instructor_id: dto.instructor_id ?? undefined,
          organization_id: dto.organization_id ?? undefined,
        },
      });
      if (isClusterExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Cluster already Exist!!");
      }

      let ClusterCreated = await this.prisma.clusters.create({
        data: {
          title: dto.title,
          description: dto.description,
          color_id: dto.color_id,
          from_grade_id: dto.from_grade_id,
          to_grade_id: dto.to_grade_id,
          is_active: true,
          instructor_id: dto.instructor_id,
          organization_id: dto.organization_id,
          created_at: new Date().toISOString(),
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (ClusterCreated) {
        return response.status(HttpStatus.OK).json(ClusterCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response, query: SearchClusterDto) {
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
      let clusterCount = await this.prisma.clusters.count({
        where: {
          is_active: true,
          title: {
            contains: query.searchByText ?? undefined,
          },
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instructor_id,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      let isClusterFound: any = await this.prisma.clusters.findMany({
        where: {
          is_active: true,
          title: {
            contains: query.searchByText ?? undefined,
          },
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instructor_id,
        },
        orderBy: [
          {
            id: query.orderBy === "Latest" ? "desc" : "asc",
          },
        ],
        include: {
          colors: true,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });


      if (isClusterFound) {
        return response.status(HttpStatus.OK).json({
          total: clusterCount,
          limit: limit,
          offset: pageNo,
          data: isClusterFound,
        });
      } else {
        throw new HttpException("Cluster Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllLearnerClusters(response: Response, query: SearchClusterDto, request: Request) {
    try {

      let user = await this.prisma.users.findUnique({
        where: {
          id: query.learner_id
        },
        select: {
          learner_details: {
            select: {
              to_grade_id: true,
              from_grade_id: true
            }
          }
        }
      })
  
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: user.learner_details[0].from_grade_id,
            lte: user.learner_details[0].to_grade_id,
          },
        },
        select: {
          id: true, 
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let cluster: any = await this.prisma.cluster_pathways.groupBy({
        by: ['cluster_id'],
        where: {
          clusters: {
            to_grade_id: {
              in: gradesArr
            },
            from_grade_id: {
              in: gradesArr
            }
          },
          pathways: {
            pathway_badges: {
              some: {
                badges: {
                  badge_courses: {
                    some: {
                      contents: {
                        learner_courses: {
                          some: {
                            learner_id: query.learner_id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        },
      });
      cluster = cluster.map((cluster) => cluster.cluster_id);
     
      if (cluster) {
        let clusterPathwayList = [];
        for (const cluster_id of cluster) {
          let pathwayList = [];
          let clusterToPathwaysList: any = await this.prisma.cluster_pathways.findMany({
            where: {
              cluster_id: {
                in: cluster_id
              },
            },
            select: {
              clusters: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  progress: true,
                  organization_id: true,
                  colors: {
                    select: {
                      name: true,
                      hex_code: true
                    }
                  },
                },
              },
              pathways: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  pathway_levels: {
                    select: {
                      pathway_badges: {
                        select: {
                          badges: {
                            select: {
                              id: true,
                              name: true,
                              description: true,
                              badge_type_id: true
                            }
                          }
                        }
                      },
                      certification_levels: {
                        select: {
                          id: true,
                          title: true
                        }
                      }
                    },
                  }
                }
              }
            }
          });
          let pathwaysids = [];
          for (const cluster of clusterToPathwaysList) {
            if (!pathwaysids.includes(cluster.pathways.id)) {
              for (const pathway_levels of cluster.pathways.pathway_levels) {
                pathwaysids.push(cluster.pathways.id)
                for (const badges of pathway_levels.pathway_badges) {
                  let attachments = await this.serviceFunction.getAttachments(
                    badges.badges.id,
                    "BadgeImage"
                  );
                  badges.badges.attachments = attachments.path
                }
              }
              pathwayList.push(cluster.pathways)
            }
          }

          clusterPathwayList.push({
            cluster: clusterToPathwaysList[0].clusters,
            pathways: pathwayList
          })
        }

        return response.status(HttpStatus.OK).json({ data: clusterPathwayList })
      } else {
        throw new HttpException("Cluster Not Found!!", HttpStatus.NOT_FOUND);
      }

    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async findAllInstructorClusters(
    response: Response,
    query: SearchInstructorClusterDto
  ) {
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

      let findClusterFromCourses = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND: [
            {
              OR: [
                {
                  organization_id: user.organization_id,
                  instructor_id:
                    user.account_type_id === 4
                      ? undefined
                      : query.instructor_id,
                },
                {
                  instructor_sessions: {
                    some: {
                      instructor_id: query.instructor_id,
                    },
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              contents_content_sessions_course_idTocontents: {
                select: {
                  badge_courses: {
                    select: {
                      badges: {
                        select: {
                          pathway_badges: {
                            select: {
                              pathways: {
                                include: {
                                  cluster_pathways: {
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
                                              certification_levels: true,
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
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      let newArray = [];
      for (let item of findClusterFromCourses) {
        for (let itemValue of item.content_sessions_content_sessions_session_idTocontents) {
          if (
            itemValue.contents_content_sessions_course_idTocontents
              .badge_courses.length > 0
          ) {
            for (let value of itemValue
              .contents_content_sessions_course_idTocontents.badge_courses) {
              if (value.badges.pathway_badges) {
                for (let instance of value.badges.pathway_badges) {
                  newArray.push(instance.pathways.cluster_pathways);
                }
              }
            }
          }
        }
      }

      const jsonData = newArray;
      const groupedPathwaysByCluster = {};
      jsonData.forEach((item) => {
        const pathwayObj = item[0];
        const clusterId = pathwayObj.cluster_id;
        const pathwayId = pathwayObj.pathway_id;
        if (!groupedPathwaysByCluster.hasOwnProperty(clusterId)) {
          groupedPathwaysByCluster[clusterId] = {
            cluster: pathwayObj.clusters,
            pathways: [],
          };
        }
        groupedPathwaysByCluster[clusterId].pathways.push(pathwayObj.pathways);
      });
      const data = JSON.parse(JSON.stringify(groupedPathwaysByCluster));
      const clusters = Object.values(data);
      const arrayOfClusters: any = Object.values(clusters);


      for (let item of arrayOfClusters) {
        for (let value of item["pathways"]) {
          for (let instance of value.pathway_levels) {
            for (let object of instance.pathway_badges) {
              let attachments = await this.serviceFunction.getAttachments(
                object.badge_id,
                "BadgeImage"
              );
              object.attachments = attachments;
            }
          }
        }
      }


      let findIndividualClusters = await this.individualCLusters(
        user.organization_id,
        user.account_type_id,
        query.instructor_id
      );

      for (let item of findIndividualClusters) {
        arrayOfClusters.push(item);
      }

      return response.status(HttpStatus.OK).json({
        data: arrayOfClusters,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let ClusterFound: any = await this.prisma.clusters.findUnique({
        where: {
          id: id,
        },
        include: {
          colors: true,
        },
      });
      if (ClusterFound) {
        return response.status(HttpStatus.OK).json(ClusterFound);
      } else {
        throw new HttpException("Cluster Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateClusterDto, response: Response) {
    try {
      let isClusterExits = await this.prisma.clusters.findUnique({
        where: {
          id: id,
        },
      });
      let isClusterUpdated = await this.prisma.clusters.update({
        where: {
          id: id,
        },
        data: {
          title: dto.title ?? isClusterExits.title,
          description: dto.description ?? isClusterExits.description,
          color_id: dto.color_id ?? isClusterExits.color_id,
          from_grade_id: dto.from_grade_id ?? isClusterExits.from_grade_id,
          to_grade_id: dto.to_grade_id ?? isClusterExits.to_grade_id,
          updated_at: new Date().toISOString(),
        },
      });
      if (isClusterUpdated) {
        return response.status(HttpStatus.OK).json(isClusterUpdated);
      } else {
        throw new HttpException("Cluster Not Updated!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isClusterFound = await this.prisma.clusters.delete({
        where: {
          id: id,
        },
      });
      if (isClusterFound) {
        return response.status(HttpStatus.OK).json(isClusterFound);
      } else {
        throw new HttpException("Cluster Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //===================color====================================================
  async createcolor(dto: colordto, response: Response) {
    try {
      let isColorExits = await this.prisma.colors.findFirst({
        where: {
          name: dto.colorName,
        },
      });
      if (isColorExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Color already Exist!!");
      }

      let iscolorCreated = await this.prisma.colors.create({
        data: {
          name: dto.colorName,
          hex_code: dto.hex_code,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        select: {
          id: true,
          hex_code: true,
        },
      });
      if (iscolorCreated) {
        return response.status(HttpStatus.OK).json(iscolorCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findallcolor(response: Response, query: SearchClusterDto) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let colorCount = await this.prisma.colors.count({
        where: {
          is_active: true,
          name: {
            contains: query.searchByText ?? undefined,
          },
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      let isColorFound = await this.prisma.colors.findMany({
        where: {
          is_active: true,
          name: {
            contains: query.searchByText ?? undefined,
          },
        },
        skip: pageNo * limit,
        take: query?.limit,
      });

      if (isColorFound) {
        return response.status(HttpStatus.OK).json({
          total: colorCount,
          limit: limit,
          offset: pageNo,
          data: isColorFound,
        });
      } else {
        throw new HttpException("Color Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOnecolor(id: number, response: Response) {
    try {
      let colorFound = await this.prisma.colors.findUnique({
        where: {
          id: id,
        },
      });
      if (colorFound) {
        return response.status(HttpStatus.OK).json(colorFound);
      } else {
        throw new HttpException("Color Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updatecolor(id: number, dto: colordto, response: Response) {
    try {
      let isColorrExits = await this.prisma.colors.findUnique({
        where: {
          id: id,
        },
      });
      let isColorUpdated = await this.prisma.colors.update({
        where: {
          id: id,
        },
        data: {
          name: dto.colorName ?? isColorrExits.name,
          hex_code: dto.hex_code ?? isColorrExits.hex_code,
          updated_at: new Date().toISOString(),
        },
      });
      if (isColorUpdated) {
        return response.status(HttpStatus.OK).json(isColorUpdated);
      } else {
        throw new HttpException("Color Not Updated!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async removecolor(id: number, response: Response) {
    try {
      let isColorFound = await this.prisma.colors.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
        },
      });
      if (isColorFound) {
        return response.status(HttpStatus.OK).json(isColorFound);
      } else {
        throw new HttpException("Color Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async individualCLusters(
    organizationId: number,
    accountTypeId: number,
    InstructorId: number
  ) {
    let isClusterFound: any = await this.prisma.clusters.findMany({
      where: {
        is_active: true,
        organization_id: organizationId,
        instructor_id: accountTypeId === 4 ? undefined : InstructorId,
      },
      select: {
        cluster_pathways: {
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
                    pathway_badges: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    for (let item of isClusterFound) {
      let attachments = await this.serviceFunction.getAttachments(
        item.badge_id,
        "BadgeImage"
      );
      item.attachments = attachments;
    }

    const jsonData = isClusterFound;
    const groupedPathwaysByCluster = {};
    jsonData.forEach((item) => {
      if (item.cluster_pathways.length > 0) {
        const pathwayObj = item.cluster_pathways[0];
        const clusterInfo = pathwayObj.clusters;
        const pathwayId = pathwayObj.pathways.id;
        if (!groupedPathwaysByCluster.hasOwnProperty(clusterInfo.id)) {
          groupedPathwaysByCluster[clusterInfo.id] = {
            cluster: clusterInfo,
            pathways: [],
          };
        }
        groupedPathwaysByCluster[clusterInfo.id].pathways.push(
          pathwayObj.pathways
        );
      }
    });

    const newJsonData = groupedPathwaysByCluster;
    const data = JSON.parse(JSON.stringify(newJsonData));
    const clusters = Object.values(data);
    const arrayOfClusters = Object.values(clusters);
    return arrayOfClusters;
  }


  async calculateLevelProgress(instance, learnerId) {
    let courses = []
    for (let item of instance.pathway_badges) {
      let findComplettion = await this.prisma.badge_courses.findMany({
        where: {
          badge_id: item.badge_id
        },
        select: {
          course_id: true
        }
      })
      courses.push(findComplettion)
    }
    const flatArray = courses[0];
    let progressArray = []
    if (flatArray.length > 0) {
      for (let item of flatArray) {
        let courseCompletion = await this.prisma.learner_courses.findFirst({
          where: {
            course_id: item.course_id,
            learner_id: learnerId
          },
          select: {
            progress: true
          }

        })
        if (courseCompletion) {
          progressArray.push(courseCompletion)
        }
      }
    }
    let totalProgress = 0
    if (progressArray.length > 0) {
      totalProgress = (progressArray.reduce((sum, item) => sum + item.progress, 0)) / progressArray.length;
    }
    return totalProgress
  }
  async calculatePathwayProgress(instance) {
    let progressArray = []
    for (let item of instance.pathway_levels) {
      progressArray.push(item.progress)
    }
    let totalProgress = (progressArray.reduce((sum, item) => sum + item, 0)) / progressArray.length;
    return totalProgress
  }
}
