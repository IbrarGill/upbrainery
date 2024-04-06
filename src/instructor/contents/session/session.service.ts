import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  AssignmentSegmentList,
  CreateSessionDto,
  InstructorList,
  LearnerList,
  ModuleSedmentlist,
  QuestSegmentList,
  QuizSegmentList,
  SearchContentSession,
  SearchSessionsBySkills,
  SessionDuplicationDto,
  ShareableLinkQueryDto,
  UpComingSessionQuery,
  learnerSessionQuery,
} from "./dto/create-session.dto";
import { UpdateInstructorList, UpdateSessionDto } from "./dto/update-session.dto";
import { Response, Request } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CourseService } from "../course/course.service";
import { Decimal } from "@prisma/client/runtime";
const jwt = require("jsonwebtoken");
@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private serviceFunction: CommonFunctionsService,
    private config: ConfigService,
    private courseService: CourseService
  ) { }

  async createContentSession(
    files: Express.Multer.File,
    dto: CreateSessionDto,
    response: Response
  ) {
    try {

      let images: any = files;
      let content_type = await this.prisma.content_types.findUnique({
        where: {
          title: "Session",
        },
      });
      let user_org = await this.prisma.users.findFirst({ where: { id: dto.instructor_id } })
      let isContentSessionCretaed = await this.prisma.contents.create({
        data: {
          title: dto.sessionName,
          content_description: dto.sessionDescription,
          availability_id: dto.sessionAvailabilityId,
          working_type_id: dto.sessionWorkTypeId,
          from_grade_id: dto.startGrade,
          to_grade_id: dto.endGrade,
          from_age: dto.startAge,
          to_age: dto.endAge,
          content_type_id: content_type.id,
          instructor_id: dto.instructor_id,
          organization_id: user_org.organization_id,
          is_active: true,
          leanerslot: 50 - dto.learnerList.length,
          isDraft: dto.isDraft ? true : false,
          created_at: new Date().toISOString()
        },
      });

      let content_sessions = await this.prisma.content_sessions.create({
        data: {
          is_published: dto.is_published,
          is_pd_session: dto.pd_session ? true : false,
          course_id: dto.course_id,
          session_id: isContentSessionCretaed.id,
          created_at: new Date().toISOString()
        },
      });

      let content_session_details =
        await this.prisma.content_session_details.create({
          data: {
            session_type_id: dto.sessionTypeId,
            start_date: dto.startDate,
            end_date: dto.endDate,
            price: dto.price,
            content_session_id: content_sessions.id,
            created_at: new Date().toISOString()
          },
        });

      if (
        isContentSessionCretaed &&
        content_sessions &&
        content_session_details
      ) {


        let result = await Promise.all([
          dto.courseSegment.modulelist ? await this.saveModuleSegment(isContentSessionCretaed.id, dto.courseSegment.modulelist) : null,
          dto.courseSegment.questSegmentList ? await this.saveQuestSegemnt(isContentSessionCretaed.id, dto.courseSegment.questSegmentList) : null,
          dto.courseSegment.assignmentSegmentList ? await this.saveAssignmentSegemnt(isContentSessionCretaed.id, dto.courseSegment.assignmentSegmentList) : null,
          dto.courseSegment.quizSegmentList ? await this.saveQuizSegment(isContentSessionCretaed.id, dto.courseSegment.quizSegmentList) : null,
          dto.learnerList ? await this.addleanertoSession(dto.course_id, content_sessions.id, dto.learnerList) : null,
          dto.instructorList ? await this.addinstructortoSession(isContentSessionCretaed.id, dto.instructorList) : null
        ])

        if (result) {
          response.status(HttpStatus.OK).json({
            message: "Session Created Succcusfully!!",
          });
        }


        let eventData = {};
        if (images.sessionPhoto) {
          eventData = {
            modelId: isContentSessionCretaed.id,
            path: `${images.sessionPhoto[0].destination}/${images.sessionPhoto[0].filename}`,
            fileName: images.sessionPhoto[0].filename,
            modelName: "SessionPhoto",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        } else {
          eventData = {
            modelId: isContentSessionCretaed.id,
            path: process.env.Default_Image_key,
            fileName: "SessionPhoto",
            modelName: "SessionPhoto",
          };
          this.eventEmitter.emit("event.Defaultattachment", eventData);
        }

        if (dto.instructorList.length > 0) {
          this.eventEmitter.emit("event.sessionassignment", isContentSessionCretaed.id, dto.instructorList, content_sessions.id)
        }
        let userOragnization = await this.prisma.users.findUnique({
          where: {
            id: dto.instructor_id,
          },
          select: {
            organization_id: true,
          },
        });
        let userManager = await this.prisma.user_manager.findMany({
          where: {
            user_id: dto.instructor_id,
          },
          select: {
            manager_id: true,
          },
        });

        let userName = await this.prisma.users.findUnique({
          where: {
            id: dto.instructor_id,
          },
          select: {
            user_name: true,
          },
        });

        if (dto.learnerList.length > 0) {
          for (let item of dto.learnerList) {
            let eventData = {
              organization_id: userOragnization.organization_id,
              receiver_user_id: item.leanerId,
              sender_user_id: dto.instructor_id,
              notifiable_type: "User",
              type: "Session",
              data: `${userName.user_name} has created a session and enrolled you`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);

          }
        }
        if (dto.instructorList.length > 0) {
          for (let item of dto.instructorList) {
            let eventData = {
              organization_id: userOragnization.organization_id,
              receiver_user_id: item.instructorId,
              sender_user_id: dto.instructor_id,
              notifiable_type: "User",
              type: "Session",
              data: `${userName.user_name} has created a session and assigned to you`,
            };
            this.eventEmitter.emit("event.savenewnofication", eventData);

          }
        }

        this.eventEmitter.emit("event.saveCourseDetailToUserSchedules", isContentSessionCretaed.id);

      } else {
        throw new HttpException(
          "Something went wroung!!",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //====================================save module and interactive========================================================================
  async saveModuleSegment(session_id: number, moduleSedmentlist: ModuleSedmentlist[]) {
    for (const item of moduleSedmentlist) {
      await this.prisma.content_module_segment_sessions.create({
        data: {
          session_id: session_id,
          content_module_segment_id: item.moduleId,
          class_type_id: item.classtypeId,
          start_date: item.startDate,
          end_date: item.endDate,
          created_at: new Date().toISOString()
        }
      })
    }
  }
  async saveQuestSegemnt(session_id: number, questSegmentList: QuestSegmentList[]) {
    for (const item of questSegmentList) {
      await this.prisma.content_interactive_segment_sessions.create({
        data: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id,
          start_date: item.startDate,
          end_date: item.endDate,
          is_assesment: item.is_assesment,
          segment_points: item.assessmentPoint,
          created_at: new Date().toISOString()
        }
      })
    }
  }
  async saveAssignmentSegemnt(session_id: number, assignmentSegmentList: AssignmentSegmentList[]) {
    for (const item of assignmentSegmentList) {
      await this.prisma.content_interactive_segment_sessions.create({
        data: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id,
          start_date: item.startDate,
          end_date: item.endDate,
          is_assesment: item.is_assesment,
          segment_points: item.assessmentPoint,
          created_at: new Date().toISOString()
        }
      })
    }

  }
  async saveQuizSegment(session_id: number, quizSegmentList: QuizSegmentList[]) {
    for (const item of quizSegmentList) {
      await this.prisma.content_interactive_segment_sessions.create({
        data: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id,
          start_date: item.startDate,
          end_date: item.endDate,
          is_quiz_graded: item.graded,
          is_quiz_offiline: item.offline,
          created_at: new Date().toISOString()
        }
      })
    }

  }
  async addleanertoSession(course_id: number, content_session_id: number, LearnerList: LearnerList[]) {
    LearnerList.map(async (item, index) => {
      await this.prisma.learner_courses.create({
        data: {
          learner_id: item.leanerId,
          course_id: course_id,
          content_session_id: content_session_id,
          session_time: 0,
          spend_time: 0,
          created_at: new Date().toISOString()
        }
      })
    })
  }
  async addinstructortoSession(session_id: number, InstructorList: InstructorList[]) {
    InstructorList.map(async (item, index) => {
      await this.prisma.instructor_sessions.create({
        data: {
          instructor_id: item.instructorId,
          session_id: session_id,
        }
      })
    })
  }
  //======================================update module and interative======================================================================

  async updateModuleSegment(session_id: number, moduleSedmentlist: ModuleSedmentlist[]) {

    moduleSedmentlist.map(async (item, index) => {
      let ismoduleSegmentFound = await this.prisma.content_module_segment_sessions.findFirst({
        where: {
          session_id: session_id,
          content_module_segment_id: item.moduleId
        },
      });
      await this.prisma.content_module_segment_sessions.update({
        where: {
          id: ismoduleSegmentFound.id
        },
        data: {
          class_type_id: item.classtypeId,
          start_date: item.startDate,
          end_date: item.endDate,
          updated_at: new Date().toISOString()
        }
      })
    });

  }
  async updateQuestSegemnt(session_id: number, questSegmentList: QuestSegmentList[]) {
    questSegmentList.map(async (item, index) => {

      let isinteractiveSegmentFound = await this.prisma.content_interactive_segment_sessions.findFirst({
        where: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id
        },
      });

      await this.prisma.content_interactive_segment_sessions.update({
        where: {
          id: isinteractiveSegmentFound.id
        },
        data: {
          start_date: item.startDate,
          end_date: item.endDate,
          is_assesment: item.is_assesment,
          segment_points: item.assessmentPoint,
          updated_at: new Date().toISOString()
        }
      })
    });

  }
  async updateAssignmentSegemnt(session_id: number, assignmentSegmentList: AssignmentSegmentList[]) {

    assignmentSegmentList.map(async (item, index) => {
      let isinteractiveSegmentFound = await this.prisma.content_interactive_segment_sessions.findFirst({
        where: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id
        },
      });

      await this.prisma.content_interactive_segment_sessions.update({
        where: {
          id: isinteractiveSegmentFound.id
        },
        data: {
          start_date: item.startDate,
          end_date: item.endDate,
          is_assesment: item.is_assesment,
          segment_points: item.assessmentPoint,
          created_at: new Date().toISOString()
        }
      })
    });
  }
  async updateQuizSegment(session_id: number, quizSegmentList: QuizSegmentList[]) {
    quizSegmentList.map(async (item, index) => {
      let isinteractiveSegmentFound = await this.prisma.content_interactive_segment_sessions.findFirst({
        where: {
          session_id: session_id,
          content_interactive_segment_id: item.content_interactive_segments_id
        },
      });

      await this.prisma.content_interactive_segment_sessions.update({
        where: {
          id: isinteractiveSegmentFound.id
        },
        data: {
          start_date: item.startDate,
          end_date: item.endDate,
          is_quiz_graded: item.graded,
          is_quiz_offiline: item.offline,
          created_at: new Date().toISOString()
        }
      })
    });
  }

  async updateleanertoSession(course_id: number, content_session_id: number, leanerList: LearnerList[]) {
    await Promise.all([
      await this.prisma.learner_courses.deleteMany({
        where: {
          content_session_id: content_session_id
        }
      }),
      leanerList.map(async (item, index) => {
        await this.prisma.learner_courses.create({
          data: {
            learner_id: item.leanerId,
            course_id: course_id,
            content_session_id: content_session_id,
            created_at: new Date().toISOString()
          }
        })
      })
    ])
  }

  async updateInstructorToSession(content_session_id: number, instructorList: UpdateInstructorList[]) {
    await Promise.all([
      await this.prisma.instructor_sessions.deleteMany({
        where: {
          session_id: content_session_id
        }
      }),
      instructorList.map(async (item, index) => {
        await this.prisma.instructor_sessions.create({
          data: {
            instructor_id: item.instructorId,
            session_id: content_session_id,
          }
        })
      })
    ])
  }
  //============================================================================================================



  async findAllSession(query: SearchContentSession, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let startDate: Date, endDate: Date;
      let startPrice: number, endprice: number;

      let subjectList: number[] = [];
      if (query?.subjects) {
        subjectList = JSON.parse(query.subjects)
      }

      if (query.startDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);
      } else {
        startDate = undefined;
        endDate = undefined;
      }

      if (query.startPrice) {
        startPrice = query.startPrice;
        endprice = query.endprice;
      } else {
        startPrice = 0;
        endprice = 1000;
      }

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Session",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: query.instuctorId } })
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: query.startGrade ?? 1,
            lte: query.endGrade ?? 12,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);
      let AllowedOrganization = [];
      if (query.sessions === undefined || query.sessions === 'Assigned to Me') {
        let organization_id_list = await this.prisma.instructor_sessions.findMany({
          where: {
            instructor_id: query?.instuctorId
          },
          select: {
            contents: {
              select: {
                organization_id: true
              }
            }
          }
        })
        for (const item of organization_id_list) {
          if (item!.contents!.organization_id)
            AllowedOrganization.push(item.contents.organization_id);
        }
        AllowedOrganization.push(user_org?.organization_id)
      } else {
        AllowedOrganization.push(user_org?.organization_id)
      }

      let contentCount = await this.prisma.contents.count({
        where: {
          is_active: true,
          AND: [
            {
              OR: [
                query?.sessions === 'Assigned to Me' ? null : {
                  instructor_id: query.instuctorId ?? undefined,
                  availabilities: {
                    id: { in: [1, 2, 3] }
                  }
                },
                user_org.account_type_id === 4 ? {
                  availabilities: {
                    id: { in: [2, 3] }
                  }
                } : null,
                query?.sessions === 'Created by Me' ? null : {
                  instructor_sessions: {
                    some: {
                      instructor_id: query.instuctorId
                    }
                  }
                }
              ],
            },
            {
              organization_id: { in: AllowedOrganization },
              isDraft: query.status ? query.status == 'Draft' : undefined,
              content_type_id: conentType.id,
              title: {
                contains: query?.searchByText ? query.searchByText.trim() : undefined,
              },
              from_grade_id: {
                in: gradesArr
              },
              to_grade_id: {
                in: gradesArr,
              },
              content_sessions_content_sessions_session_idTocontents: {
                some: {
                  is_pd_session: query?.is_pd_session ? true : undefined,
                  content_session_details: {
                    some: {
                      AND:
                        [
                          {
                            OR:
                              [
                                {
                                  session_type_id: query.session_type_id ?? undefined,
                                },
                                {
                                  start_date: {
                                    gte: startDate ?? undefined,
                                    lte: endDate ?? undefined,
                                  },
                                },
                                {
                                  price: {
                                    gte: startPrice ?? undefined,
                                    lte: endprice ?? undefined,
                                  },
                                },

                              ]
                          },

                          {
                            content_sessions: subjectList.length > 0 ? {
                              contents_content_sessions_course_idTocontents: {
                                content_module_segments: {
                                  some: {
                                    content_module_segment_activities: {
                                      some: {
                                        contents_content_module_segment_activities_content_activity_idTocontents: {
                                          content_subject_disciplines: {
                                            some: {
                                              subject_id: { in: subjectList }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            } : undefined
                          }
                        ]

                    },
                  },
                },
              },
            }
          ],
        },
      });

      let isFound: any = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND: [
            {
              OR: [
                query?.sessions === 'Assigned to Me' ? null : {
                  instructor_id: query.instuctorId ?? undefined,
                  availabilities: {
                    id: { in: [1, 2, 3] }
                  }
                },
                user_org.account_type_id === 4 ? {
                  availabilities: {
                    id: { in: [2, 3] }
                  }
                } : null,
                query?.sessions === 'Created by Me' ? null : {
                  instructor_sessions: {
                    some: {
                      instructor_id: query.instuctorId
                    }
                  }
                }
              ],
            },
            {
              organization_id: { in: AllowedOrganization },
              isDraft: query.status ? query.status == 'Draft' : undefined,
              content_type_id: conentType.id,
              title: {
                contains: query?.searchByText ? query.searchByText.trim() : undefined,
              },
              from_grade_id: {
                in: gradesArr
              },
              to_grade_id: {
                in: gradesArr,
              },
              content_sessions_content_sessions_session_idTocontents: {
                some: {
                  is_pd_session: query?.is_pd_session ? true : undefined,
                  content_session_details: {
                    some: {
                      AND:
                        [
                          {
                            OR:
                              [
                                {
                                  session_type_id: query.session_type_id ?? undefined,
                                },
                                {
                                  start_date: {
                                    gte: startDate ?? undefined,
                                    lte: endDate ?? undefined,
                                  },
                                },
                                {
                                  price: {
                                    gte: startPrice ?? undefined,
                                    lte: endprice ?? undefined,
                                  },
                                },

                              ]
                          },

                          {
                            content_sessions: subjectList.length > 0 ? {
                              contents_content_sessions_course_idTocontents: {
                                content_module_segments: {
                                  some: {
                                    content_module_segment_activities: {
                                      some: {
                                        contents_content_module_segment_activities_content_activity_idTocontents: {
                                          content_subject_disciplines: {
                                            some: {
                                              subject_id: { in: subjectList }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            } : undefined
                          }
                        ]

                    },
                  },
                },
              },
            }
          ],
        },
        orderBy: [
          query.orderBy === "Latest Session" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Session" ? {
            id: "asc"
          } : null,
          query.orderBy === "Sort By A-Z" ? {
            title: "asc"
          } : null,
          query.orderBy === "Sort By Z-A" ? {
            title: "desc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          id: true,
          title: true,
          content_description: true,
          duration: true,
          from_grade_id: true,
          to_grade_id: true,
          from_age: true,
          to_age: true,
          isDraft: true,
          leanerslot: true,
          instructor_id: true,
          users: {
            select: {
              id: true,
              user_name: true
            }
          },
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              course_id: true,
            },
          },
        },
      });
      if (isFound) {



        for (const item of isFound) {

          let createdbyAttachment = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );
          item.users.image_url = createdbyAttachment?.path ?? null;

          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "SessionPhoto"
          );
          item.attachments = attachments;
          let content_session_id = item.content_sessions_content_sessions_session_idTocontents[0].id;
          let course_id = item.content_sessions_content_sessions_session_idTocontents[0].course_id;

          let session_learner = await this.prisma.learner_courses.findMany({
            where: {
              course_id: course_id,
              content_session_id: content_session_id
            },
            select: {
              users: {
                select: {
                  id: true,
                  user_name: true,
                  first_name: true,
                  last_name: true,
                  email: true
                }
              }
            }
          })

          item.remainingSpot = item.leanerslot

          let course: any = await this.prisma.contents.findUnique({
            where: {
              id: course_id,
            },
            include: {
              content_module_segments: {
                select: {
                  content_module_segment_activities: {
                    select: {
                      id: true,
                      content_activity_id: true,
                      contents_content_module_segment_activities_content_activity_idTocontents: {
                        select: {
                          id: true,
                          title: true,
                          content_description: true,
                          duration: true,
                          from_grade_id: true,
                          to_grade_id: true,
                          to_age: true,
                        }
                      }
                    }
                  }
                }
              },
            },
          });

          let courseDuration = 0;
          for (const module of course.content_module_segments) {
            for (const activities of module.content_module_segment_activities) {
              courseDuration = courseDuration + activities.contents_content_module_segment_activities_content_activity_idTocontents.duration
            }
          }
          item.duration = courseDuration;
          delete item.content_sessions_content_sessions_session_idTocontents
        }
        response.status(HttpStatus.OK).json({
          total: contentCount,
          limit: limit,
          offset: pageNo,
          data: isFound,
        });
      } else {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getSessionfilters(instuctorId: number, response: Response) {
    try {
      const subjectsKeyMap = new Map();
      const sessionTypeKeyMap = new Map();
      const availabilitiesKeyMap = new Map();
      let maxPrice = new Decimal('0.0');
      let minPrice = new Decimal('0.0');
      let subjectList = [];
      let sessiontypeList = [];
      let availabilitiesList = [];

      let conentType = await this.prisma.content_types.findUnique({
        where: {
          title: "Session",
        },
      });

      let user_org = await this.prisma.users.findFirst({ where: { id: instuctorId } })

      let grades = await this.prisma.grades.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      let AssignedSession = await this.prisma.instructor_sessions.findFirst({
        where: {
          instructor_id: instuctorId,
        },
      });

      let filtersfound = await this.prisma.contents.findMany({
        where: {
          is_active: true,
          AND: [
            {
              OR:
                [
                  {
                    instructor_id: instuctorId,
                    availabilities: {
                      id: { in: [1, 2, 3] }
                    }
                  },
                  user_org.account_type_id === 4 ? {
                    availabilities: {
                      id: { in: [2, 3] }
                    }
                  } : null
                ]
            },
            {
              organization_id: user_org?.organization_id,
              content_type_id: conentType.id,
            }
          ]
        },
        select: {
          duration: true,
          to_age: true,
          from_age: true,
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
                  session_types: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              },
            },
          },
          availabilities: true,
        }
      });

      if (filtersfound) {
        for (const item of filtersfound) {
          let course_id = item.content_sessions_content_sessions_session_idTocontents[0].course_id;
          if (item.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].price > maxPrice) {
            maxPrice = item.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].price
          }

          const sessiontypekey = `${item.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].session_type_id}`;
          if (!sessionTypeKeyMap.has(sessiontypekey)) {
            sessionTypeKeyMap.set(sessiontypekey, true);
            sessiontypeList.push({
              id: item.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].session_types.id,
              title: item.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].session_types.name
            })
          }

          const availabilitieskey = `${item.availabilities.id}-${item.availabilities.title}`;
          if (!availabilitiesKeyMap.has(availabilitieskey)) {
            availabilitiesKeyMap.set(availabilitieskey, true);
            availabilitiesList.push({
              id: item.availabilities.id,
              title: item.availabilities.title
            })
          }

          let CourseFound = await this.prisma.contents.findUnique({
            where: {
              id: course_id
            },
            select: {
              content_module_segments: {
                select: {
                  content_module_segment_activities: {
                    select: {
                      contents_content_module_segment_activities_content_activity_idTocontents:
                      {
                        select: {
                          content_subject_disciplines: {
                            select: {
                              subjects: {
                                select: {
                                  id: true,
                                  name: true,
                                },
                              },
                              subject_disciplines: {
                                select: {
                                  id: true,
                                  name: true,
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
            }
          });

          if (CourseFound) {
            for (const _activities of CourseFound.content_module_segments) {
              for (const item of _activities.content_module_segment_activities) {
                item.contents_content_module_segment_activities_content_activity_idTocontents.content_subject_disciplines.forEach(
                  (element) => {
                    const subjectkey = `${element.subjects.id}`;
                    if (!subjectsKeyMap.has(subjectkey)) {
                      subjectsKeyMap.set(subjectkey, true);
                      subjectList.push({
                        id: element.subjects.id,
                        title: element.subjects.name
                      })
                    }
                  }
                );
              }
            }
          }

        }

        response.status(HttpStatus.OK).json({
          filters: {
            maxPrice: maxPrice.toNumber(),
            minPrice: minPrice.toNumber(),
            session: {
              "Assigned to Me": filtersfound ? true : false,
              "Created by Me": AssignedSession ? true : false
            },
            subjectList,
            sessiontypeList,
            availabilitiesList,
            grades,
          }
        })
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOneSession(id: number, query: ShareableLinkQueryDto, response: Response) {
    try {
      if (query?.token) {
        const SHAREABLE_LINK_SECRET = this.config.get("SHAREABLE_LINK_SECRET");
        try {
          const isvalid = jwt.verify(query.token, SHAREABLE_LINK_SECRET);
          if (isvalid) {
            var payload = this.parseJwt(query.token);
            let learners: number[] = payload.learners
            let learnersEmails: string[] = payload.emails
            let UserFoundindb = await this.prisma.users.findMany({
              where: {
                email: {
                  in: learnersEmails
                }
              },
              select: {
                id: true
              }
            })
            UserFoundindb.map((item, index) => {
              if (!learners.includes(item.id))
                learners.push(item.id)
            })


            if (learners.includes(query.userId)) {
              let isSessionExit = await this.prisma.contents.findFirst({
                where: {
                  id: id,
                  content_types: {
                    title: "Session"
                  }
                },
                select: {
                  id: true,
                  content_sessions_content_sessions_session_idTocontents: {
                    select: {
                      id: true,
                      is_published: true,
                      course_id: true,
                      is_pd_session: true,
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
                },
              });
              let course_id = isSessionExit.content_sessions_content_sessions_session_idTocontents[0].course_id;
              let content_session_id = isSessionExit.content_sessions_content_sessions_session_idTocontents[0].id;


              let session_learner = await this.prisma.learner_courses.findMany({
                where: {
                  course_id: course_id,
                  content_session_id: content_session_id
                },
                select: {
                  progress: true,
                  users: {
                    select: {
                      id: true,
                      user_name: true,
                      first_name: true,
                      last_name: true,
                      email: true
                    }
                  }
                }
              })
              let allreadyLearnerInSession = []
              session_learner.map((item, index) => {
                allreadyLearnerInSession.push(item.users.id)
              })

              if (!allreadyLearnerInSession.includes(query.userId)) {
                await this.prisma.learner_courses.create({
                  data: {
                    course_id: course_id,
                    content_session_id: content_session_id,
                    learner_id: query.userId
                  }
                })
              }


            } else {
              return response.status(HttpStatus.FORBIDDEN).json({ message: 'You are not Authorised to Access this Session' })
            }
          }
        } catch (error) {
          throw new HttpException("Invalid Token", HttpStatus.FORBIDDEN);
        }

      }


      let isFound: any = await this.prisma.contents.findFirst({
        where: {
          id: id,
          content_types: {
            title: "Session"
          }
        },
        select: {
          id: true,
          title: true,
          content_description: true,
          duration: true,
          from_grade_id: true,
          working_type_id: true,
          to_grade_id: true,
          from_age: true,
          to_age: true,
          content_type_id: true,
          instructor_id: true,
          availability_id: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              is_published: true,
              course_id: true,
              is_pd_session: true,
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
        },
      });





      if (isFound) {
        let instuctor = await this.prisma.users.findUnique({
          where: {
            id: isFound.instructor_id
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_name: true,
            email: true
          }
        })

        let course_id = isFound.content_sessions_content_sessions_session_idTocontents[0].course_id;
        let content_session_id = isFound.content_sessions_content_sessions_session_idTocontents[0].id;
        let is_pd_session = isFound.content_sessions_content_sessions_session_idTocontents[0].is_pd_session;
        let activities = [];
        let quiz = [];
        let quest = [];
        let assignment = [];
        let skills = [];
        let standards = [];
        let subjects = [];
        let vocabularies = [];
        let modulelist = [];
        let sessDuration = 0;
        let Session3Dmodel = [];
        const skillKeyMap = new Map();
        const subjectsKeyMap = new Map();


        let course: any = await this.prisma.contents.findFirst({
          where: {
            id: course_id,
            content_types: {
              title: "Course"
            }
          },
          include: {
            badge_courses: {
              select: {
                id: true,
                badge_id: true,
                badges: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                course_id: true,
              },
            },
            working_types: {
              select: {
                id: true,
                title: true,
              },
            },
            content_blocks: {
              select: {
                blocks: {
                  select: {
                    id: true,
                    title: true,
                    is_instructor_only: true,
                    description: true,
                  },
                },
              },
            },
            content_interactive_segments: {
              select: {
                id: true,
                start_date: true,
                end_date: true,
                is_assesment: true,
                segment_points: true,
                is_quiz_graded: true,
                is_quiz_offiline: true,
                interactive_id: true,
                interactives: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    interactive_types_interactives_interactive_type_idTointeractive_types: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            content_module_segments: {
              select: {
                id: true,
                module: true,
                start_date: true,
                end_date: true,
                class_types: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                segment_points: true,
                module_segment_types: {
                  select: {
                    id: true,
                    title: true
                  }
                },
                module_segment_deliveries: {
                  select: {
                    id: true,
                    title: true
                  }
                },
                content_module_segment_activities: {
                  select: {
                    id: true,
                    content_activity_id: true,
                    contents_content_module_segment_activities_content_activity_idTocontents: {
                      select: {
                        id: true,
                        title: true,
                        content_description: true,
                        duration: true,
                        from_grade_id: true,
                        to_grade_id: true,
                        to_age: true,
                        content_blocks: {
                          select: {
                            id: true,
                            block_id: true,
                            blocks: {
                              select: { id: true }
                            }
                          }
                        },

                        content_skills: {
                          select: {
                            id: true,
                            skills: {
                              select: {
                                title: true
                              }
                            },
                            sub_skills: {
                              select: {
                                title: true
                              }
                            },
                            skill_points: true
                          }
                        },
                        content_standards: {
                          select: {
                            standards: {
                              select: {
                                id: true,
                                title: true,
                                standard_types: {
                                  select: {
                                    id: true,
                                    title: true
                                  }
                                },
                                standard_levels: {
                                  select: {
                                    id: true,
                                    title: true
                                  }
                                },
                                standard_subjects: {
                                  select: {
                                    id: true,
                                    title: true
                                  }
                                }
                              }
                            }
                          }
                        },
                        content_subject_disciplines: {
                          select: {
                            id: true,
                            subjects: {
                              select: {
                                id: true,
                                name: true
                              },

                            },
                            subject_disciplines: {
                              select: {
                                id: true,
                                name: true
                              }
                            }
                          }
                        },
                        content_vocabularies: {
                          select: {
                            id: true,
                            vocabulary: true,
                            vocabulary_definition: true
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


        let session_learner: any = await this.prisma.learner_courses.findMany({
          where: {
            course_id: course_id,
            content_session_id: content_session_id
          },
          select: {
            progress: true,
            users: {
              select: {
                id: true,
                user_name: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        })

        let session_instructor: any = await this.prisma.instructor_sessions.findMany({
          where: {
            session_id: isFound.id,
          },
          select: {
            users: {
              select: {
                id: true,
                user_name: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        })

        let totalSessionProgress = 0;
        for (const item of session_learner) {
          const attachments = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );
          totalSessionProgress = totalSessionProgress + item.progress
          item.users.attachments = attachments;
        }
        totalSessionProgress = totalSessionProgress / session_learner.length

        for (const item of session_instructor) {
          const attachments = await this.serviceFunction.getAttachments(
            item.users.id,
            "User"
          );
          item.users.attachments = attachments;
        }

        for (const item of course.badge_courses) {
          const attachments = await this.serviceFunction.getAttachments(
            item.badge_id,
            "BadgeImage"
          );
          item.attachments = attachments;
        }



        for (const item of course?.content_interactive_segments) {

          if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {

            let sessionQuizFound = await this.prisma.content_interactive_segment_sessions.findFirst({
              where: {
                session_id: isFound.id,
                content_interactive_segment_id: item.id
              }
            })

            quiz.push({
              content_interactive_segments_id: sessionQuizFound?.content_interactive_segment_id,
              interactive_Id: item.interactives?.id,
              title: item.interactives?.title,
              description: item.interactives?.description,
              start_date: sessionQuizFound?.start_date,
              end_date: sessionQuizFound?.end_date,
              is_quiz_graded: sessionQuizFound?.is_quiz_graded,
              is_quiz_offiline: sessionQuizFound?.is_quiz_offiline,
            })

          } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {

            let sessionQuest = await this.prisma.content_interactive_segment_sessions.findFirst({
              where: {
                session_id: isFound.id,
                content_interactive_segment_id: item.id
              }
            })

            quest.push({
              content_interactive_segments_id: sessionQuest?.content_interactive_segment_id,
              interactive_Id: item.interactives?.id,
              title: item.interactives?.title,
              description: item.interactives.description,
              start_date: sessionQuest?.start_date,
              end_date: sessionQuest?.end_date,
              is_assesment: sessionQuest?.is_assesment,
              segment_points: sessionQuest?.segment_points
            })

          } else {

            let sessionAssignment = await this.prisma.content_interactive_segment_sessions.findFirst({
              where: {
                session_id: isFound.id,
                content_interactive_segment_id: item.id
              }
            })

            assignment.push({
              content_interactive_segments_id: sessionAssignment?.content_interactive_segment_id,
              interactive_Id: item.interactives?.id,
              title: item.interactives?.title,
              description: item.interactives?.description,
              start_date: sessionAssignment?.start_date,
              end_date: sessionAssignment?.end_date,
              is_assesment: sessionAssignment?.is_assesment,
              segment_points: sessionAssignment?.segment_points
            })
          }
        }


        for (const _activities of course.content_module_segments) {

          let moduleSessionDuration = 0;
          let sessionActivities = await this.prisma.content_module_segment_sessions.findFirst({
            where: {
              session_id: isFound.id,
              content_module_segment_id: _activities.id
            }
          })





          for (const item of _activities.content_module_segment_activities) {
            let activity_attachments: any = await this.serviceFunction.getAttachments(
              item.contents_content_module_segment_activities_content_activity_idTocontents.id,
              "Activity"
            );
            course.attachments = activity_attachments;





            sessDuration = sessDuration + item.contents_content_module_segment_activities_content_activity_idTocontents.duration
            moduleSessionDuration = moduleSessionDuration + item.contents_content_module_segment_activities_content_activity_idTocontents.duration



            activities.push({
              id: item.contents_content_module_segment_activities_content_activity_idTocontents.id,
              title: item.contents_content_module_segment_activities_content_activity_idTocontents.title,
              content_description: item.contents_content_module_segment_activities_content_activity_idTocontents.content_description,
              duration: item.contents_content_module_segment_activities_content_activity_idTocontents.duration,
              from_grade_id: item.contents_content_module_segment_activities_content_activity_idTocontents.from_grade_id,
              to_grade_id: item.contents_content_module_segment_activities_content_activity_idTocontents.to_grade_id,
              to_age: item.contents_content_module_segment_activities_content_activity_idTocontents.to_age,
              start_date: sessionActivities?.start_date,
              end_date: sessionActivities?.end_date,
              class_types: sessionActivities?.class_type_id,
              attachments: activity_attachments
            })



            for (const attachment of item?.contents_content_module_segment_activities_content_activity_idTocontents?.content_blocks) {
              const attachments = await this.serviceFunction.getmultipleAttachments(
                attachment.blocks.id,
                "block"
              );
              if (attachments) {
                for (const model of attachments) {
                  if (model.attachment_types.name === '3D') {
                    Session3Dmodel.push(model.path)
                  }
                }
              }
            }


            item?.contents_content_module_segment_activities_content_activity_idTocontents.content_skills.forEach((element) => {
              const key = `${element.skills.title}-${element.sub_skills.title}`;
              if (!skillKeyMap.has(key)) {
                skillKeyMap.set(key, true);
                skills.push({
                  skills: element.skills.title,
                  sub_skills: element.sub_skills.title,
                  skill_points: element.skill_points,
                })
              }

            }

            )

            item.contents_content_module_segment_activities_content_activity_idTocontents.content_standards.forEach((element) => {
              standards.push(element)
            })


            item.contents_content_module_segment_activities_content_activity_idTocontents.content_subject_disciplines.forEach((element) => {
              const key = `${element.subjects.name}-${element.subject_disciplines.name}`;
              if (!subjectsKeyMap.has(key)) {
                subjectsKeyMap.set(key, true);
                subjects.push(element)
              }


            })
            item.contents_content_module_segment_activities_content_activity_idTocontents.content_vocabularies.forEach((element) => vocabularies.push
              (element))

          }

          modulelist.push({
            module: _activities?.module,
            moduleId: _activities?.id,
            startDate: sessionActivities?.start_date,
            endDate: sessionActivities?.end_date,
            classtypeId: sessionActivities?.class_type_id,
            duration: moduleSessionDuration,
            grades: `${isFound.from_grade_id}-${isFound.to_grade_id}`,
            age: `${isFound.from_age}-${isFound.to_age}`,
          })

        }

        isFound.course_id = course_id;
        isFound.duration = sessDuration;
        isFound.is_published = isFound.content_sessions_content_sessions_session_idTocontents[0].is_published
        isFound.is_pd_session = is_pd_session;
        isFound.content_session_details = isFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0];
        isFound.totalSessionProgress = totalSessionProgress;
        isFound.session_learner = session_learner;
        isFound.Session3Dmodel = Session3Dmodel;
        isFound.badge_courses = course.badge_courses;
        isFound.quiz = quiz;
        isFound.quest = quest;
        isFound.assignment = assignment;
        isFound.modulelist = modulelist;
        isFound.activities = activities;
        isFound.skills = skills;
        isFound.standards = standards;
        isFound.subjects = subjects;
        isFound.vocabularies = vocabularies;
        isFound.activities = activities;
        isFound.course = course;
        isFound.instuctor = instuctor
        isFound.session_instructor = session_instructor
        delete isFound.content_sessions_content_sessions_session_idTocontents;


        let attachments: any = await this.serviceFunction.getAttachments(
          isFound.id,
          "SessionPhoto"
        );
        isFound.attachments = attachments;

        response.status(HttpStatus.OK).json(isFound);
      } else {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateContentSession(files: Express.Multer.File, session_id: number, dto: UpdateSessionDto, response: Response) {
    try {
      let images: any = files;
      let sessionFound = await this.prisma.contents.findUnique({
        where: {
          id: session_id,
        },
        include: {
          content_sessions_content_sessions_session_idTocontents: {
            include: {
              content_session_details: true
            }
          }
        },
      });

      if (sessionFound) {

        let promise = await Promise.all([

          dto.courseSegment ? dto.course_id === sessionFound.content_sessions_content_sessions_session_idTocontents[0].course_id ? this.updateModuleSegment(sessionFound.id, dto.courseSegment.modulelist) : this.saveModuleSegment(sessionFound.id, dto.courseSegment.modulelist) : null,
          dto.courseSegment ? dto.course_id === sessionFound.content_sessions_content_sessions_session_idTocontents[0].course_id ? this.updateQuestSegemnt(sessionFound.id, dto.courseSegment.questSegmentList) : this.saveQuestSegemnt(sessionFound.id, dto.courseSegment.questSegmentList) : null,
          dto.courseSegment ? dto.course_id === sessionFound.content_sessions_content_sessions_session_idTocontents[0].course_id ? this.updateAssignmentSegemnt(sessionFound.id, dto.courseSegment.assignmentSegmentList) : this.saveAssignmentSegemnt(sessionFound.id, dto.courseSegment.assignmentSegmentList) : null,
          dto.courseSegment ? dto.course_id === sessionFound.content_sessions_content_sessions_session_idTocontents[0].course_id ? this.updateQuizSegment(sessionFound.id, dto.courseSegment.quizSegmentList) : this.saveQuizSegment(sessionFound.id, dto.courseSegment.quizSegmentList) : null,
          dto.learnerList ? this.updateleanertoSession(dto.course_id, sessionFound.content_sessions_content_sessions_session_idTocontents[0].id, dto.learnerList) : null,
          dto.instructorList ? this.updateInstructorToSession(sessionFound.id, dto.instructorList) : null,

          await this.prisma.contents.update({
            where: {
              id: session_id,
            },
            data: {
              title: dto.sessionName ?? sessionFound.title,
              content_description: dto.sessionDescription ?? sessionFound.content_description,
              availability_id: dto.sessionAvailabilityId ?? sessionFound.availability_id,
              working_type_id: dto.sessionWorkTypeId ?? sessionFound.working_type_id,
              from_grade_id: dto.startGrade ?? sessionFound.from_grade_id,
              to_grade_id: dto.endGrade ?? sessionFound.to_grade_id,
              from_age: dto.startAge ?? sessionFound.from_age,
              to_age: dto.endAge ?? sessionFound.to_age,
              isDraft: dto.isDraft ? true : false,
              leanerslot: 50 - dto.learnerList.length,
              updated_at: new Date().toISOString()
            },
          }),

          await this.prisma.content_sessions.update({
            where: {
              id: sessionFound.content_sessions_content_sessions_session_idTocontents[0].id
            },
            data: {
              is_published: dto.is_published ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].is_published,
              is_pd_session: dto?.pd_session ? dto?.pd_session ? true : false : sessionFound.content_sessions_content_sessions_session_idTocontents[0].is_pd_session,
              course_id: dto.course_id ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].course_id,
              session_id: session_id,
              content_session_details: {
                updateMany: [{
                  where: {
                    id: sessionFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].id
                  },
                  data: {
                    session_type_id: dto.sessionTypeId ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].session_type_id,
                    start_date: dto.startDate ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].start_date,
                    end_date: dto.endDate ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].end_date,
                    price: dto.price ?? sessionFound.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].price,
                  }
                }]
              },
              updated_at: new Date().toISOString()
            },
          })
        ])



        if (promise) {
          this.findOneSession(session_id, null, response);
          let eventData = {};
          if (images.sessionPhoto) {
            eventData = {
              modelId: session_id,
              path: `${images.sessionPhoto[0].destination}/${images.sessionPhoto[0].filename}`,
              fileName: images.sessionPhoto[0].filename,
              modelName: "SessionPhoto",
            };
            this.eventEmitter.emit("event.updateattachment", eventData);
          }

          if (dto.instructorList.length > 0) {
            this.eventEmitter.emit("event.updatesessionassignment", session_id, dto.instructorList)
          }

        } else {
          throw new HttpException(
            "Something went wroung!!",
            HttpStatus.BAD_REQUEST
          );
        }


      } else {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAllLeanerSession(query: learnerSessionQuery, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let learner_session_count = await this.prisma.learner_courses.count({
        where: {
          learner_id: query.learnerId,
          contents: {
            title: {
              contains: query?.searchByText
                ? query.searchByText.trim()
                : undefined,
            },
          }
        }
      })

      let learner_session: any = await this.prisma.learner_courses.findMany({
        where: {
          learner_id: query.learnerId,
          contents: {
            title: {
              contains: query?.searchByText
                ? query.searchByText.trim()
                : undefined,
            },
          }
        },
        orderBy: query?.orderBy ? [
          query.orderBy === "Latest Session"
            ? {
              id: "desc",
            }
            : null,
          query.orderBy === "Oldest Session"
            ? {
              id: "asc",
            }
            : null,
          query.orderBy === "Sort By A-Z"
            ? {
              contents: {
                title: 'asc'
              },
            }
            : null,
          query.orderBy === "Sort By Z-A"
            ? {
              contents: {
                title: 'desc'
              },
            }
            : null,
        ] : [{
          id: "desc",
        }],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          content_sessions: {
            select: {
              contents_content_sessions_session_idTocontents: {
                select: {
                  id: true,
                  title: true,
                  content_description: true,
                  from_grade_id: true,
                  to_grade_id: true,
                  to_age: true,
                  from_age: true,
                  duration: true,
                  instructor_id: true,
                  content_sessions_content_sessions_session_idTocontents: {
                    select: {
                      id: true,
                      course_id: true,
                    },
                  },
                }
              },
              content_session_details: {
                select: {
                  start_date: true,
                  end_date: true
                }
              }
            }
          }
        }
      });

      if (learner_session[0]?.content_sessions != null) {
        let sessionList = []
        for (const item of learner_session) {
          if (item.content_sessions != null) {
            let attachments: any = await this.serviceFunction.getAttachments(
              item.content_sessions?.contents_content_sessions_session_idTocontents?.id,
              "SessionPhoto"
            );
            item.content_sessions.contents_content_sessions_session_idTocontents.attachments = attachments;
            const combinedObject = { ...item.content_sessions.contents_content_sessions_session_idTocontents, ...item.content_sessions.content_session_details[0] };


            if (query.quest) {
              let questFound = 0;
              let totalquest = 0;
              let course_id = item.content_sessions.contents_content_sessions_session_idTocontents.content_sessions_content_sessions_session_idTocontents[0].course_id

              let quest = [];
              let course: any = await this.prisma.contents.findFirst({
                where: {
                  id: course_id,
                  content_types: {
                    title: "Course"
                  }
                },
                include: {
                  content_interactive_segments: {
                    select: {
                      id: true,
                      start_date: true,
                      end_date: true,
                      is_assesment: true,
                      segment_points: true,
                      is_quiz_graded: true,
                      is_quiz_offiline: true,
                      interactive_id: true,
                      interactives: {
                        select: {
                          id: true,
                          title: true,
                          description: true,
                          to_grade_id: true,
                          from_grade_id: true,
                          interactive_types_interactives_interactive_type_idTointeractive_types: {
                            select: {
                              name: true
                            }
                          }
                        }
                      }
                    }
                  },

                },
              });

              for (const item of course?.content_interactive_segments) {

                if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
                  totalquest++;
                  let attachments = await this.serviceFunction.getAttachments(
                    item.interactives.id,
                    "Interactives"
                  );

                  let isquizFound = await this.prisma.interactive_quest_submissions.findFirst({
                    where: {
                      learner_id: query.learnerId,
                      interactive_id: item?.interactives.id
                    },
                  })
                  if (isquizFound) questFound++
                  quest.push({
                    id: item.interactives.id,
                    title: item.interactives.title,
                    description: item.interactives.description,
                    submitted: isquizFound ? true : false,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    to_grade_id: item.interactives.to_grade_id,
                    from_grade_id: item.interactives.from_grade_id,
                    is_assesment: item.is_assesment,
                    segment_points: item.segment_points,
                    video_url: attachments.path
                  })
                }
              }
              combinedObject.questTotal = `${questFound}/${totalquest}`
              combinedObject.questDetails = quest
            }


            delete combinedObject.content_sessions_content_sessions_session_idTocontents
            sessionList.push(combinedObject)
          }
        }
        response.status(HttpStatus.OK).json({
          total: learner_session_count,
          limit: limit,
          offset: pageNo,
          sessionList
        });
      } else {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  //==============================Clearing session from db========================================================================
  async removeSessionFromDB(session_id: number, response: Response) {
    try {

      let sessionFound = await this.prisma.contents.findFirst({
        where: {
          id: session_id,
          content_types: {
            title: "Session"
          }
        },
        select: {
          id: true,
          instructor_id: true,
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              course_id: true,
            },
          },
        },
      });

      if (!sessionFound) {
        throw new HttpException(
          "Content Session Not Found!!",
          HttpStatus.BAD_REQUEST
        );
      }
      let content_session_id = sessionFound.content_sessions_content_sessions_session_idTocontents[0].id;

      let isSessionCleared = await Promise.all([
        this.clearAllSessionLearners(content_session_id),
        this.clearAllSessionInstructors(session_id),
        this.ClearAllContentInteractiveSegment(session_id),
        this.clearAllContentModuleSegment(session_id),
        this.clearCourseMappingToInstructors(content_session_id),
        this.clearActivitiesMappingToInstructors(content_session_id),
        this.clearInteractiveMappingtoInstructors(content_session_id),
      ])

      let sessionDeleted = await this.prisma.contents.update({
        where: {
          id: session_id
        },
        data: {
          is_active: false
        }
      })

      if (isSessionCleared && sessionDeleted) {
        response.status(HttpStatus.OK).json('Session Deleted Succesfully');
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async clearAllSessionInstructors(session_id: number) {
    try {
      await this.prisma.instructor_sessions.deleteMany({
        where: {
          session_id: session_id,
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async clearAllSessionLearners(content_session_id: number) {
    try {
      await this.prisma.learner_courses.deleteMany({
        where: {
          content_session_id: content_session_id,
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async ClearAllContentInteractiveSegment(session_id: number) {
    try {
      await this.prisma.content_interactive_segment_sessions.deleteMany({
        where: {
          session_id: session_id,
          created_at: new Date().toISOString()
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async clearAllContentModuleSegment(session_id: number) {
    try {
      await this.prisma.content_module_segment_sessions.deleteMany({
        where: {
          session_id: session_id,
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async clearCourseMappingToInstructors(content_session_id: number) {
    try {
      await this.prisma.instructor_courses.deleteMany({
        where: {
          content_session_id: content_session_id
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async clearActivitiesMappingToInstructors(content_session_id: number) {
    try {
      await this.prisma.instructor_activities.deleteMany({
        where: {
          content_session_id: content_session_id
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  async clearInteractiveMappingtoInstructors(content_session_id: number) {
    try {
      await this.prisma.instructor_interactives.deleteMany({
        where: {
          content_session_id: content_session_id
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  //================================================================================================================================

  async duplicateSession(query: SessionDuplicationDto, response: Response) {
    try {

      let UserSessionExit = await this.prisma.contents.findFirst({
        where: {
          id: query.sessionId,
          content_types: {
            title: "Session",
          }
        },
        include: {
          content_sessions_content_sessions_session_idTocontents: {
            select: {
              id: true,
              is_published: true,
              course_id: true,
              contents_content_sessions_course_idTocontents: {
                select: {
                  id: true,
                  title: true
                }
              },
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
          content_sessions_content_sessions_course_idTocontents: true
        }
      });

      let isContentSessionCretaed = await this.prisma.contents.create({
        data: {
          title: query?.sessionName ?? UserSessionExit.title + ' copy',
          content_description: UserSessionExit.content_description,
          availability_id: UserSessionExit.availability_id,
          working_type_id: UserSessionExit.working_type_id,
          from_grade_id: UserSessionExit.from_grade_id,
          to_grade_id: UserSessionExit.to_grade_id,
          from_age: UserSessionExit.from_age,
          to_age: UserSessionExit.to_age,
          content_type_id: UserSessionExit.content_type_id,
          instructor_id: query.createrID,
          organization_id: UserSessionExit.organization_id,
          leanerslot: UserSessionExit.leanerslot,
          isDraft: false,
          is_active: true,
          created_at: new Date().toISOString()
        },
      });

      let duplicatedCourseId = await this.courseService.duplicateCourse({
        courseId: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].course_id,
        createrID: query.createrID,
        courseName: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].contents_content_sessions_course_idTocontents.title + ' ' + query.sessionName
      }, null)

      let content_sessions = await this.prisma.content_sessions.create({
        data: {
          is_published: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].is_published,
          course_id: duplicatedCourseId,
          session_id: isContentSessionCretaed.id,
          created_at: new Date().toISOString()
        },
      });

      await this.prisma.content_session_details.create({
        data: {
          session_type_id: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].session_type_id,
          start_date: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].start_date,
          end_date: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].end_date,
          price: UserSessionExit.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0].price,
          content_session_id: content_sessions.id,
          created_at: new Date().toISOString()
        },
      });


      let attachments = await this.serviceFunction.getAttachments(
        UserSessionExit.id,
        "SessionPhoto"
      );

      if (attachments) {
        await this.prisma.attachments.create({
          data: {
            attachment_type_id: attachments.attachment_types.id,
            path: attachments.path,
            Image_key: attachments.Image_key,
            field_name: 'SessionPhoto',
            attachmentable_id: isContentSessionCretaed.id,
            attachmentable_type: 'SessionPhoto',
            created_at: new Date().toISOString()
          },
        });
      }

      response.status(HttpStatus.OK).json({
        message: 'Session Duplicated Succesfully!!'
      });

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  parseJwt(token: string) {
    var base64Payload = token.split(".")[1];
    var payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
  }


  async upcomingsession(query: UpComingSessionQuery, response: Response) {

    try {
      let currentDate = new Date().toISOString();
      let allsession: any = await this.prisma.contents.findMany({
        where: {
          organization_id: query.organization_id ?? undefined,
          instructor_id: query.instructor_id ?? undefined,
          content_sessions_content_sessions_session_idTocontents: {
            some: {
              content_session_details: {
                some: {
                  start_date: {
                    gt: currentDate
                  }
                }
              }
            }
          }
        },
        select: {
          id: true,
          title: true,
          content_description: true,
          duration: true,
          from_grade_id: true,
          to_grade_id: true,
          from_age: true,
          to_age: true,
        }
      })
      if (allsession) {
        for (const item of allsession) {
          let attachments = await this.serviceFunction.getAttachments(
            item.id,
            "SessionPhoto"
          );
          item.SessionPhoto = attachments.path;
        }

        response.status(HttpStatus.OK).json(allsession)
      } else {

      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  // =============================================================================================

  async sesssionBySkills(query: SearchSessionsBySkills, response: Response, request: Request) {
    try {
      let user: any = request.user;
      let SubSkillsId: any = await this.prisma.sub_skills.findMany({
        where: {
          title: query.sub_skill_name
        },
        select: {
          id: true
        }
      })
      SubSkillsId = SubSkillsId.map((subSkill) => subSkill.id);

      let findSessions = await this.prisma.contents.findMany({
        where: {
          organization_id: user.organization_id,
          content_sessions_content_sessions_session_idTocontents: {
            some: {
              contents_content_sessions_course_idTocontents: {
                content_module_segments: {
                  some: {
                    content_module_segment_activities: {
                      some: {
                        contents_content_module_segment_activities_content_activity_idTocontents: {
                          content_skills: {
                            some: {
                              sub_skill_id: {
                                in: SubSkillsId
                              }
                            }
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
        select: {
          id: true,
          title: true,
        }

      })
      return response.status(HttpStatus.OK).json({ data: findSessions })
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

}
