import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBadgeDto, CreateBadgeTypeDto, Searchbadges, SearchbadgesType, badge_courses_dto, pathway_badges_dto } from './dto/create-badge.dto';
import { UpdateBadgeDto, UpdateCreateBadgeTypeDto } from './dto/update-badge.dto';
import { Response, Request } from "express";
import { PrismaService } from 'src/prisma/prisma.client';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { CommonFunctionsService } from 'src/services/commonService';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  //=================================================Badges==================================================================
  async create(files: Express.Multer.File, dto: CreateBadgeDto, response: Response) {
    try {
      let images: any = files;
      let isBadgesCreated = await this.prisma.badges.create({
        data: {
          name: dto.name,
          description: dto.description,
          instructor_id: dto.instructor_id,
          badge_type_id: dto.badge_type_id,
          availability_id: dto.availability_id,
          amount: dto.amount,
          organization_id: dto.organization_id,
          is_active: 1,
          is_draft: dto.is_draft ? 1 : 0,
        }
      })

      await Promise.all([
        this.saveBadgecourses(dto.badge_courses, isBadgesCreated.id),
        this.saveBadgepathways(dto.pathway_badges, isBadgesCreated.id)
      ])

      if (isBadgesCreated) {
        response.status(HttpStatus.OK).json({
          message: "Badges Created Succcusfully!!",
        });
        let eventData = {};

        if (images.BadgeImage) {
          eventData = {
            modelId: isBadgesCreated.id,
            path: `${images.BadgeImage[0].destination}/${images.BadgeImage[0].filename}`,
            fileName: images.BadgeImage[0].filename,
            modelName: "BadgeImage",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        } else {
          eventData = {
            modelId: isBadgesCreated.id,
            path: process.env.Default_Image_key,
            fileName: "BadgeImage",
            modelName: "BadgeImage",
          };
          this.eventEmitter.emit("event.Defaultattachment", eventData);
        }
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async saveBadgecourses(badge_courses_dto: badge_courses_dto[], badge_id: number) {
    try {
      badge_courses_dto.map(async (item, index) => {
        await this.prisma.badge_courses.create({
          data: {
            course_id: item.courseId,
            badge_id: badge_id
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  async saveBadgepathways(pathway_badges_dto: pathway_badges_dto[], badge_id: number) {
    try {
      pathway_badges_dto.map(async (item, index) => {
        await this.prisma.pathway_badges.create({
          data: {
            pathway_level_id: item.pathway_level_id,
            pathway_id: item.pathway_id,
            badge_id: badge_id
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  async findAll(query: Searchbadges, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let badgesCount = await this.prisma.badges.count({
        where: {
          AND: [
            {
              is_active: 1,
              instructor_id: query.instuctorId ?? undefined,
              is_draft: query.status ? query.status == 'Draft' ? 1 : 0 : undefined,
              badge_type_id: query.badgeTypeId ?? undefined,
              name: {
                contains: query?.searchByText ? query.searchByText.trim() : undefined,
              },
            },
            {
              OR: [
                {
                  organization_id: { in: [6, query.organization_id] }
                }
              ]
            }
          ]

        },
      });

      let isFound: any = await this.prisma.badges.findMany({
        where: {
          AND: [
            {
              is_active: 1,
              instructor_id: query.instuctorId ?? undefined,
              organization_id: query.organization_id ?? undefined,
              is_draft: query.status ? query.status == 'Draft' ? 1 : 0 : undefined,
              badge_type_id: query.badgeTypeId ?? undefined,
              name: {
                contains: query?.searchByText ? query.searchByText.trim() : undefined,
              },
            },
            {
              OR: [
                {
                  organization_id: { in: [6, query.organization_id] }
                }
              ]
            }
          ]
        },
        orderBy: [
          query.orderBy === "Latest Badges" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Badges" ? {
            id: "asc"
          } : null,
          query.orderBy === "Sort By A-Z" ? {
            name: "asc"
          } : null,
          query.orderBy === "Sort By Z-A" ? {
            name: "desc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit ?? undefined,

        select: {
          id: true,
          name: true,
          description: true,
          badge_type_id: true,
          availability_id: true,
          amount: true,
          badge_types: {
            select: {
              id: true,
              name: true
            }
          },
          availabilities: {
            select: {
              id: true,
              title: true
            }
          }
        },
      });

      if (isFound) {
        for (const item of isFound) {
          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "BadgeImage"
          );
          item.attachments = attachments;
        }
        response.status(HttpStatus.OK).json({
          total: badgesCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException(
          "Badges Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response, request: Request) {
    try {
      let user: any = request.user

      let isFound: any = await this.prisma.badges.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          name: true,
          description: true,
          badge_type_id: true,
          availability_id: true,
          amount: true,
          pathway_badges: {
            select: {
              pathways: {
                include: {
                  cluster_pathways: {
                    select: {
                      clusters: {
                        select: {
                          id: true,
                          title: true,
                        }
                      }
                    }
                  },
                  pathway_levels: true,
                }
              },
            }
          }
        },
      });

      if (isFound) {
        let attachments: any = await this.serviceFunction.getAttachments(
          isFound.id,
          "BadgeImage"
        );
        isFound.attachments = attachments;

        let courses: any = await this.prisma.badge_courses.findMany({
          where: {
            badge_id: isFound.id,
          },
          select: {
            contents: {
              select: {
                id: true,
                title: true,
                organization_id: true
              }
            }
          }
        })
        let coursesList = courses.map((item, index) => {
          if (item.contents.organization_id === user.organization_id) {
            return item.contents
          }
        })

        for (const course of coursesList) {
          let sessionFound: any = await this.prisma.content_sessions.findMany({
            where: {
              course_id: course?.id
            },
            select: {
              contents_content_sessions_session_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  content_description: true,
                  leanerslot: true,
                  duration: true,
                  organization_id: true,
                }
              },
              content_session_details: {
                select: {
                  price: true,
                  session_types: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  start_date: true,
                  end_date: true
                }
              }
            },
          });

          if (sessionFound) {
            let AssociatedsessionList = [];
            for (const item of sessionFound) {

              if (user.organization_id === item.contents_content_sessions_session_idTocontents.organization_id) {
                let attachments = await this.serviceFunction.getAttachments(
                  item?.contents_content_sessions_session_idTocontents?.id,
                  "SessionPhoto"
                );
                item.contents_content_sessions_session_idTocontents
                item.contents_content_sessions_session_idTocontents.SessionPhoto = attachments?.path ?? null;
                const combinedObject = { ...item?.contents_content_sessions_session_idTocontents, ...item?.content_session_details[0] };
                AssociatedsessionList.push(combinedObject)
              }
            }
            course.AssociatedsessionList = AssociatedsessionList
          }
        }

        let cluster = []
        for (const pathway of isFound.pathway_badges) {
          for (const cluster_pathways of pathway.pathways.cluster_pathways) {
            cluster.push(cluster_pathways.clusters)
          }
        }
        isFound.courses = coursesList;
        isFound.cluster = cluster;
        response.status(HttpStatus.OK).json(isFound);
      } else {
        throw new HttpException(
          "Badge Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(files: Express.Multer.File, id: number, dto: UpdateBadgeDto, response: Response) {
    try {
      let images: any = files;
      let isBadgesExited = await this.prisma.badges.findUnique({
        where: {
          id
        }
      })
      let isBadgesCreated = await this.prisma.badges.update({
        where: {
          id: isBadgesExited.id
        },
        data: {
          name: dto.name ?? isBadgesExited.name,
          description: dto.description ?? isBadgesExited.description,
          badge_type_id: dto.badge_type_id ?? isBadgesExited.badge_type_id,
          availability_id: dto.availability_id ?? isBadgesExited.availability_id,
          amount: dto.amount ?? isBadgesExited.amount,
          no_of_courses: dto.no_of_courses ?? isBadgesExited.no_of_courses
        }
      })

      if (isBadgesCreated) {
        response.status(HttpStatus.OK).json({
          message: "Badges Updated Succcusfully!!",
        });
        let eventData = {};
        if (images.BadgeImage) {
          eventData = {
            modelId: isBadgesCreated.id,
            path: `${images.BadgeImage[0].destination}/${images.BadgeImage[0].filename}`,
            fileName: images.BadgeImage[0].filename,
            modelName: "BadgeImage",
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isFound: any = await this.prisma.badges.update({
        where: {
          id
        },
        data: {
          is_draft: 0
        },
      });
      if (isFound) {
        response.status(HttpStatus.OK).json({
          message: 'badges Disalbed Successfully'
        });
      } else {
        throw new HttpException(
          "Badge Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  //=================================================Badges type==================================================================


  async createbagdetype(dto: CreateBadgeTypeDto, response: Response) {
    try {
      let isBadgesTypeCreated = await this.prisma.badge_types.create({
        data: {
          name: dto.name,
        }
      })
      if (isBadgesTypeCreated) {
        response.status(HttpStatus.OK).json(isBadgesTypeCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getAllbadgeTyes(query: SearchbadgesType, response: Response) {
    try {
      let allBadgesTypes: any = await this.prisma.badge_types.findMany({
        select: {
          id: true,
          name: true
        }
      })
      if (allBadgesTypes) {
        for (const item of allBadgesTypes) {
          let count = await this.prisma.badges.count({
            where: {
              badge_type_id: item.id,
              is_active: 1,
              instructor_id: query.instuctorId ?? undefined,
              organization_id: query.organization_Id ?? undefined
            }
          })
          item.count = count;
        }
        const transformedData = allBadgesTypes.reduce((acc, item) => {
          acc[item.name.replace(/\s+/g, '')] = item;
          return acc;
        }, {});

        response.status(HttpStatus.OK).json(transformedData);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updatebadgestype(id: number, dto: UpdateCreateBadgeTypeDto, response: Response) {
    try {
      let isBadgesCreated = await this.prisma.badge_types.create({
        data: {
          name: dto.name
        }
      })
      if (isBadgesCreated) {
        response.status(HttpStatus.OK).json({
          message: "Badges Updated Succcusfully!!",
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async removebadgestype(id: number, response: Response) {
    try {
      let isFound: any = await this.prisma.badges.delete({
        where: {
          id
        },
      });
      if (isFound) {
        response.status(HttpStatus.OK).json({
          message: 'badgesType Disalbed Successfully'
        });
      } else {
        throw new HttpException(
          "Badge Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

}
