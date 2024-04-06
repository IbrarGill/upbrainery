import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrganizationDto, Graph1QueryDto, Graph2QueryDto, SearchOrganazitionInstituteQuery, SearchOrganazitionInstuctorQuery, SearchOrganazitionLearnerQuery } from './dto/create-organization.dto';
import { UpdateOrganizationDto, UpdateOrganizationUserDto } from './dto/update-organization.dto';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { PrismaService } from 'src/prisma/prisma.client';
import { Response } from "express";
import { randomUUID } from 'crypto';
import { CommonFunctionsService } from 'src/services/commonService';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';

@Injectable()
export class OrganizationService {

  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(dto: CreateOrganizationDto, response: Response) {
    try {

      let isOrganizationExit = await this.prisma.organizations.findFirst({
        where: {
          name: dto.organizationName,
        },
      });
      if (isOrganizationExit) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Organzation already Exist!!");
      }

      let OrganizationCreated = await this.prisma.organizations.create({
        data: {
          name: dto.organizationName,
          is_active: 1,
          pid: dto.pid,
          code: randomUUID(),
          organization_type_id: dto.organization_type_id,
          orgnization_details: {
            create: {
              contact_name: dto.contact_name,
              contact_no: dto.contact_no
            }
          }
        },
        select: {
          id: true,
          name: true,
          organization_type_id: true,
          orgnization_details: true
        },
      });
      if (OrganizationCreated) {
        response.status(HttpStatus.OK).json(OrganizationCreated);
        let eventData = {
          modelId: OrganizationCreated.id,
          path: process.env.Default_User_Image_key,
          fileName: "OrgLogo",
          modelName: "OrgLogo",
        };

        this.eventEmitter.emit("event.Defaultattachment", eventData);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllOrganization(response: Response) {
    try {
      let isOrganizationFound = await this.prisma.organizations.findMany({
        where: {
          is_active: 1,
          pid: null,
        },
        select: {
          id: true,
          name: true
        },
      });
      if (isOrganizationFound) {
        return response.status(HttpStatus.OK).json(isOrganizationFound);
      } else {
        throw new HttpException("Organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllOrganizationinstitutions(id: number, response: Response) {
    try {
      let isOrganizationFound = await this.prisma.organizations.findMany({
        where: {
          is_active: 1,
          pid: id,
        },
        select: {
          id: true,
          name: true
        },
      });
      if (isOrganizationFound) {
        return response.status(HttpStatus.OK).json(isOrganizationFound);
      } else {
        throw new HttpException("Organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let organizationFound = await this.prisma.organizations.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          organization_type_id: true,
          orgnization_details: {
            select: {
              contact_name: true,
              contact_no: true
            }
          }
        },
      });
      if (organizationFound) {
        return response.status(HttpStatus.OK).json(organizationFound);
      } else {
        throw new HttpException("Organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateOrganizationDto, response: Response) {
    try {
      let isOrganizationUpdated = await this.prisma.organizations.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
        data: {
          name: dto.organizationName,
          organization_type_id: dto.organization_type_id,
          orgnization_details: {
            create: {
              contact_name: dto.contact_name,
              contact_no: dto.contact_no
            }
          }
        },
      });
      if (isOrganizationUpdated) {
        return response.status(HttpStatus.OK).json(isOrganizationUpdated);
      } else {
        throw new HttpException("organization Not Updated!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isorganizationFound = await this.prisma.organizations.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
        data: {
          is_active: 0
        }
      });
      if (isorganizationFound) {
        return response.status(HttpStatus.OK).json(isorganizationFound);
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async findOneOrganizationUser(id: number, response: Response) {
    try {
      let organization: any = await this.prisma.users.findFirst({
        where: {
          id,
          account_types: {
            name: 'Organzation'
          }
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          email: true,
          organizations: {
            select: {
              organizations_organizations_organization_type_idToorganizations: {
                select: {
                  id: true,
                  name: true
                }
              },
              orgnization_details: {
                select: {
                  id: true,
                  contact_name: true,
                  contact_no: true
                }
              }
            },
          }
        }
      });
      if (organization) {
        let attachments: any = await this.serviceFunction.getAttachments(
          organization.id,
          "User"
        );
        organization.attachments = attachments;
        delete organization.refresh_token;
        delete organization.password;

        return response.status(HttpStatus.OK).json(organization);
      } else {
        throw new HttpException(
          "Organization Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateOrganizationUser(organization_User_id: number, files: Express.Multer.File, dto: UpdateOrganizationUserDto, response: Response) {
    try {
      let images: any = files;

      let userExit = await this.prisma.users.findFirst({
        where: { id: organization_User_id },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          email: true,
          organization_id: true,
          organizations: {
            select: {
              organizations_organizations_organization_type_idToorganizations: {
                select: {
                  id: true,
                  name: true
                }
              },
              orgnization_details: {
                select: {
                  id: true,
                  contact_name: true,
                  contact_no: true
                }
              }
            },
          }
        }
      });

      let isUpdated = await this.prisma.users.update({
        where: { id: organization_User_id },
        data: {
          first_name: dto.organizationName,
          last_name: '',
          user_name: dto.username,
          email: dto.email
        }
      });

      await this.prisma.organizations.update({
        where: {
          id: userExit.organization_id
        },
        data: {
          organization_type_id: dto.organization_type_id ?? userExit.organizations.organizations_organizations_organization_type_idToorganizations.id,
          orgnization_details: {
            update: {
              where: {
                id: userExit.organizations.orgnization_details[0].id
              },
              data: {
                contact_name: dto.contact_name,
                contact_no: dto.contact_no
              }
            }
          }
        }
      })

      if (isUpdated) {
        delete isUpdated.password;
        this.findOneOrganizationUser(organization_User_id, response);
        if (images.avator) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.avator[0].destination}/${images.avator[0].filename}`,
            fileName: images.avator[0].filename,
            modelName: "User",
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        }
        if (images.OrganizationLogo) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.OrganizationLogo[0].destination}/${images.OrganizationLogo[0].filename}`,
            fileName: images.OrganizationLogo[0].filename,
            modelName: "OrgLogo",
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async organizationstats(organizationId: number, request: Request, response: Response) {
    try {

      let gradesArr: any = await this.prisma.grades.findMany({
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      let isorganizationStatistics = await Promise.all([
        this.getorganizationCourseCount(organizationIdList),
        this.getorganizationSessionCount(organizationIdList),
        this.getorganizationInstructorCount(organizationIdList, gradesArr),
        this.getorganizationLeanerCount(organizationIdList, gradesArr),
        this.getorganizationPathwaysCount(organizationIdList),
      ])
      if (isorganizationStatistics) {
        let statistics = {
          courses: isorganizationStatistics[0],
          sessions: isorganizationStatistics[1],
          instructor: isorganizationStatistics[2],
          leaners: isorganizationStatistics[3],
          pathways: isorganizationStatistics[4],
        }
        return response.status(HttpStatus.OK).json(statistics);
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getorganizationCourseCount(organizationIdList: number[]) {
    try {
      return await this.prisma.contents.count({
        where: {
          content_types: {
            title: 'Course'
          },
          organization_id: { in: organizationIdList }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async getorganizationSessionCount(organizationIdList: number[]) {
    try {
      return await this.prisma.contents.count({
        where: {
          content_types: {
            title: 'Session'
          },
          organization_id: { in: organizationIdList }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async getorganizationPathwaysCount(organizationIdList: number[]) {
    try {
      return await this.prisma.pathways.count({
        where: {
          organization_id: { in: organizationIdList }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async getorganizationLeanerCount(organizationIdList: number[], gradesArr: number[]) {
    try {
      return await this.prisma.users.count({
        where: {
          account_types: {
            name: 'Learner'
          },
          organization_id: { in: organizationIdList },
          learner_details: {
            some: {
              to_grade_id: { in: gradesArr },
              from_grade_id: { in: gradesArr }
            }
          }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async getorganizationInstructorCount(organizationIdList: number[], gradesArr: number[]) {
    try {
      return await this.prisma.users.count({
        where: {
          account_types: {
            name: 'Instructor'
          },
          organization_id: { in: organizationIdList },
          tutor_experiances: {
            every: {
              to_grade_id: {
                in: gradesArr
              },
              from_grade_id: {
                in: gradesArr
              }
            }
          }
        },

      })
    } catch (error) {
      console.log(error)
    }
  }

  async getorganizationInstituteCount(organizationIdList: number[]) {
    try {
      return await this.prisma.organizations.count({
        where: {
          pid: { in: organizationIdList }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async graph1(query: Graph1QueryDto, response: Response) {
    try {
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.grade ? +query.grade.split('-')[0] : 1,
            lte: query.grade ? +query.grade.split('-')[1] : 12,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let _startDate = moment(query.startDate);
      const _endDate = moment(query.endDate);
      const yearsList = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      // Calculate the difference in days
      const monthsCount = _endDate.diff(_startDate, 'months');
      const years = [];
      let userInYear = []

      for (let index = 0; index <= monthsCount; index++) {
        if (index != 0) {
          _startDate = _startDate.add(1, 'months');
        }
        let getMonth = _startDate.month()
        years.push(`${yearsList[getMonth]}-${_startDate.year()}`)
        userInYear.push(0)
      }


      const week = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      const userInWeeks = [
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      const months = [
        "1st",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
        "13th",
        "14th",
        "15th",
        "16th",
        "17th",
        "18th",
        "19th",
        "20th",
        "21st",
        "22nd",
        "23rd",
        "24th",
        "25th",
        "26th",
        "27th",
        "28th",
        "29th",
        "30th",
        "31st"
      ];
      const userInMonths = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ];

      let userFound = await this.prisma.users.findMany({
        where: {
          organization_id: query.organizationId,
          account_type_id: query.accountTypeId ?? undefined,
          AND: [
            {
              created_at: {
                gte: query.startDate,
              },
            },
            {
              created_at: {
                lte: query.endDate,
              },
            },
          ],
          learner_details: query.accountTypeId == 3 ? {
            some: {
              to_grade_id: { in: gradesArr },
              from_grade_id: { in: gradesArr }
            }
          } : undefined,
          tutor_experiances: query.accountTypeId == 1 ? {
            every: {
              to_grade_id: { in: gradesArr },
              from_grade_id: { in: gradesArr }
            }
          } : undefined
        },
      });
      if (userFound) {
        const startDate = moment(query.startDate);
        const endDate = moment(query.endDate);

        // Calculate the difference in days
        const daysDifference = endDate.diff(startDate, 'days');

        let data = {}
        if (daysDifference <= 30 && daysDifference > 7) {

          userFound.map((item, index) => {
            userInMonths[item.created_at.getDate()]++
          })

          data = {
            data: months,
            users: userInMonths
          }
        } else if (daysDifference <= 7) {
          userFound.map((item, index) => {
            userInWeeks[item.created_at.getDay()]++
          })

          data = {
            data: week,
            users: userInWeeks
          }
        } else {


          userFound.map((item, index) => {
            let monthsofyear = `${yearsList[item.created_at.getMonth()]}-${item.created_at.getFullYear()}`
            let indexOf = years.indexOf(monthsofyear)
            userInYear[indexOf]++
          })

          data = {
            data: years,
            users: userInYear
          }
        }


        return response.status(HttpStatus.OK).json(data);
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async graph2(query: Graph2QueryDto, response: Response) {
    try {
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.grade ? +query.grade.split('-')[0] : 1,
            lte: query.grade ? +query.grade.split('-')[1] : 12,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);


      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: query.organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(query.organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      let isorganizationStatistics = await Promise.all([
        this.getorganizationInstructorCount(organizationIdList, gradesArr),
        this.getorganizationLeanerCount(organizationIdList, gradesArr),
        this.getorganizationInstituteCount(organizationIdList)
      ])
      if (isorganizationStatistics) {
        let statistics = {
          instructors: isorganizationStatistics[0],
          leaners: isorganizationStatistics[1],
          institutes: isorganizationStatistics[2]
        }
        return response.status(HttpStatus.OK).json(statistics);
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async graph3(organizationId: number, response: Response) {
    try {

      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      let isorganizationFound = await this.prisma.contents.findMany({
        where: {
          organization_id: { in: organizationId },
          content_types: {
            title: 'Session'
          },
        },
        orderBy: {
          leanerslot: 'asc'
        },
        take: 5,
        select: {
          id: true,
          title: true,
          leanerslot: true,
        }

      });
      if (isorganizationFound) {
        let labels = [];
        let data = [];
        isorganizationFound.map((item, index) => {
          labels.push(item.title)
          data.push(50 - item.leanerslot)
        })

        return response.status(HttpStatus.OK).json({
          labels, data
        });
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async graph4(organizationId: number, response: Response) {
    try {

      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      let allBadgesTypes = await this.prisma.badge_types.findMany({
        select: {
          id: true,
          name: true
        }
      })
      if (allBadgesTypes) {
        let labels = [];
        let data = [];
        for (const item of allBadgesTypes) {
          let count = await this.prisma.badges.count({
            where: {
              badge_type_id: item.id,
              is_active: 1,
              organization_id: { in: organizationIdList }
            }
          })

          labels.push(item.name);
          data.push(count)
        }


        response.status(HttpStatus.OK).json({
          labels, data
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async top5EarnedBagdesByLearners(organizationId: number, response: Response) {
    try {
      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      const top5Badges = await this.prisma.learner_badges.groupBy({
        where: { organization_id: { in: organizationIdList } },
        by: ['badge_id'],
        _count: {
          learner_id: true,
        },
        orderBy: {
          _count: {
            learner_id: 'desc'
          },
        },
        take: 5,
      });
      if (top5Badges) {
        let labels = [];
        let data = [];

        for (const item of top5Badges) {
          let badge = await this.prisma.badges.findUnique({
            where: {
              id: item.badge_id,
            },
            select: {
              name: true
            }
          })

          labels.push(badge.name);
          data.push(item._count.learner_id)
        }

        response.status(HttpStatus.OK).json({
          labels, data
        });
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async top3clusters(organizationId: number, response: Response) {
    try {
      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      const top3clusters: any = await this.prisma.clusters.findMany({
        where: {
          organization_id: { in: organizationIdList }
        },
        select: {
          id: true,
          title: true,
          description: true,
          to_grade_id: true,
          from_grade_id: true,
          cluster_pathways: true,
        },
        take: 3,
        orderBy: {
          cluster_pathways: {
            _count: 'desc'
          },
        },
      });

      if (top3clusters) {
        top3clusters.map((item, index) => {
          item.pathways = item.cluster_pathways.length
          delete item.cluster_pathways
        })
        response.status(HttpStatus.OK).json(top3clusters);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async top3Pathways(organizationId: number, response: Response) {
    try {

      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      const top3Pathways: any = await this.prisma.pathways.findMany({
        where: {
          organization_id: { in: organizationId }
        },
        select: {
          id: true,
          name: true,
          description: true,
          pathway_badges: true,
        },
        take: 3,
        orderBy: {
          pathway_badges: {
            _count: 'desc'
          },
        },
      });

      if (top3Pathways) {
        top3Pathways.map((item, index) => {
          item.badgesCount = item.pathway_badges.length
          delete item.pathway_badges
        })
        response.status(HttpStatus.OK).json(top3Pathways);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllorganizationinstructors(query: SearchOrganazitionInstuctorQuery, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let subjectList: number[] = [];
      if (query?.subjectList) {
        subjectList = JSON.parse(query.subjectList)
      }

      let is_block: boolean;
      if (query?.status === 'Active') {
        is_block = false;
      } else if (query?.status === 'InActive') {
        is_block = true;
      } else {
        is_block = undefined;
      }

      let account_types = await this.prisma.account_types.findUnique({
        where: {
          name: "Instructor",
        },
      });
      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: query.organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(query.organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }


      let userCount = await this.prisma.users.count({
        where: {
          account_type_id: account_types.id,
          organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
          is_block: is_block,
          tutor_experiances: {
            some: subjectList.length > 0 ? {
              subject_id: { in: subjectList }
            } : undefined
          },
          user_name: {
            contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
          },
        },

        orderBy: [
          query.orderBy === "Latest Instructor" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Instructor" ? {
            id: "asc"
          } : null,
        ],
      });

      let isFound: any = await this.prisma.users.findMany({
        where: {
          account_type_id: account_types.id,
          organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
          is_block: is_block,
          tutor_experiances: {
            some: subjectList.length > 0 ? {
              subject_id: { in: subjectList }
            } : undefined
          },
          user_name: {
            contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
          },
        },
        skip: pageNo * limit,
        take: query?.limit,
        orderBy: [
          query.orderBy === "Latest Instructor" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Instructor" ? {
            id: "asc"
          } : null,
        ],
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          bio: true,
          per_hour_rate: true,
          is_block: true,
          organizations: {
            select: {
              id: true,
              name: true,
            }
          },
          tutor_experiances: {
            select: {
              to_grade_id: true,
              from_grade_id: true,
              subjects: {
                select: {
                  id: true,
                  name: true,
                },
              },
              experty_levels: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (isFound) {
        for (const item of isFound) {
          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "User"
          );
          item.attachments = attachments;
        }

        response.status(HttpStatus.OK).json({
          total: userCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException("Instructors Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllorganizationlearners(query: SearchOrganazitionLearnerQuery, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let account_types = await this.prisma.account_types.findUnique({
        where: {
          name: "Learner",
        },
      });




      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.grade ? +query.grade.split('-')[0] : 1,
            lte: query.grade ? +query.grade.split('-')[1] : 13,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);


      // organization Learners
      let content_Session_Id = [];


      if (query?.instructorId) {

        let Sessions = await this.prisma.instructor_sessions.findMany({
          where: {
            instructor_id: query.instructorId,
          },
          include: {
            contents: {
              select: {
                id: true,
                content_sessions_content_sessions_session_idTocontents: {
                  select: {
                    id: true,
                    is_published: true,
                    course_id: true,
                    content_session_details: {
                      select: {
                        id: true,
                        session_type_id: true,
                        start_date: true,
                        end_date: true,
                        price: true,
                      }
                    },
                  },
                },
              }
            }
          }
        })

        for (const item of Sessions) {
          if (item?.contents?.content_sessions_content_sessions_session_idTocontents[0]?.id) {
            content_Session_Id.push(item?.contents?.content_sessions_content_sessions_session_idTocontents[0]?.id)
          }
        }
      }
      let is_block: boolean;
      if (query?.status === 'Active') {
        is_block = false;
      } else if (query?.status === 'InActive') {
        is_block = true;
      } else {
        is_block = undefined;
      }

      let organizationIdList = [];
      let allorginstitutions = await this.prisma.organizations.findMany({
        where: {
          pid: query.organizationId,
        },
        select: {
          id: true
        }
      });
      organizationIdList.push(query.organizationId)
      for (const org of allorginstitutions) {
        organizationIdList.push(org.id)
      }

      let userCount: number;
      let isFound: any;
      if (query?.IsPDSession) {
        userCount = await this.prisma.users.count({
          where: {
            organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
            is_block: is_block,
            user_name: {
              contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
            },
            instructor_pd_id: {
              not: null
            }
          },
        });

        isFound = await this.prisma.users.findMany({
          where: {
            organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
            is_block: is_block,
            user_name: {
              contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
            },
            instructor_pd_id: {
              not: null
            }
          },
          skip: pageNo * limit,
          take: query?.limit ?? undefined,
          orderBy: [
            query.orderBy === "Latest Learner" ? {
              id: "desc",
            } : null,
            query.orderBy === "Oldest Learner" ? {
              id: "asc"
            } : null,
          ],
          select: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                user_name: true,
                email: true,
                bio: true,
                per_hour_rate: true,
                is_block: true,
                account_type_id: true,
                organizations: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                learner_details: {
                  select: {
                    to_grade_id: true,
                    from_grade_id: true
                  }
                }
              },
            }
          }
        });

        for (let i = 0; i < isFound.length; i++) {
          const userObject = isFound[i].users;
          delete isFound[i].users; // Remove the "users" property
          isFound[i] = { ...isFound[i], ...userObject }; // Merge userObject into the main object
        }

      } else {

        userCount = await this.prisma.users.count({
          where: {
            account_type_id: account_types.id,
            organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
            is_block: is_block,
            user_name: {
              contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
            },
            learner_details: {
              some: {
                to_grade_id: { in: gradesArr },
                from_grade_id: { in: gradesArr }
              }
            },
            learner_courses: {
              some: query.instructorId ? {
                content_session_id: {
                  in: content_Session_Id
                }
              } : undefined,
            }
          },
        });

        isFound = await this.prisma.users.findMany({
          where: {
            account_type_id: account_types.id,
            organization_id: query.instituteId ? query.instituteId : { in: organizationIdList },
            is_block: is_block,
            user_name: {
              contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
            },
            learner_details: {
              some: {
                to_grade_id: { in: gradesArr },
                from_grade_id: { in: gradesArr }
              }
            },
            learner_courses: {
              some: query.instructorId ? {
                content_session_id: {
                  in: content_Session_Id
                }
              } : undefined,
            }
          },
          skip: pageNo * limit,
          take: query?.limit ?? undefined,
          orderBy: [
            query.orderBy === "Latest Learner" ? {
              id: "desc",
            } : null,
            query.orderBy === "Oldest Learner" ? {
              id: "asc"
            } : null,
          ],
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_name: true,
            email: true,
            bio: true,
            per_hour_rate: true,
            is_block: true,
            account_type_id: true,
            organizations: {
              select: {
                id: true,
                name: true,
              }
            },
            learner_details: {
              select: {
                to_grade_id: true,
                from_grade_id: true
              }
            }
          },
        });
      }

      if (isFound) {
        for (const item of isFound) {
          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "User"
          );
          item.attachments = attachments;
        }

        response.status(HttpStatus.OK).json({
          total: userCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException("Learners Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllorganizationInstitute(query: SearchOrganazitionInstituteQuery, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let gradesArr: any = await this.prisma.grades.findMany({
        select: {
          id: true,
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let userCount = await this.prisma.organizations.count({
        where: {
          pid: query.organizationId,
          name: {
            contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
          },
        },
      });

      let isFound: any = await this.prisma.organizations.findMany({
        where: {
          pid: query.organizationId,
          name: {
            contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
          },
        },
        skip: pageNo * limit,
        take: query?.limit ?? undefined,
        orderBy: [
          {
            id: 'desc'
          }
        ],
        select: {
          id: true,
          name: true,
          organization_type_id: true,
          is_active: true,
          orgnization_details: {
            select: {
              contact_name: true,
              contact_no: true
            }
          }
        },
      });

      if (isFound) {
        for (const item of isFound) {
          let attachments = await this.serviceFunction.getAttachments(
            item.id,
            "OrgLogo"
          );
          item.logo = attachments.path;

          let isorganizationStatistics = await Promise.all([
            this.getorganizationCourseCount(item.id),
            this.getorganizationSessionCount(item.id),
            this.getorganizationInstructorCount(item.id, gradesArr),
            this.getorganizationLeanerCount(item.id, gradesArr),
          ])
          if (isorganizationStatistics) {
            let statistics = {
              courses: isorganizationStatistics[0],
              sessions: isorganizationStatistics[1],
              instructor: isorganizationStatistics[2],
              leaners: isorganizationStatistics[3],
            }
            item.statistics = statistics
          }

        }

        response.status(HttpStatus.OK).json({
          total: userCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException("Learners Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
