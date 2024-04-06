import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  CreateInstructorDto,
  InstructorAllLearnerQuery,
  InstructorAllSessionQuery,
  InstructorDashbaordQuery,
  SearchInstuctorQuery,
} from "./dto/create-instructor.dto";
import { UpdateInstructorDto } from "./dto/update-instructor.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  TutorCredentailsDto,
  TutorExpierencedto,
  TutorteachingStyleDto,
} from "src/auth/dto/create-auth.dto";
import { AuthService } from "src/auth/auth.service";
@Injectable()
export class InstructorService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2,
  ) { }

  async findAll(query: SearchInstuctorQuery, response: Response) {
    try {

      let grades: number[];
      let subjects: number[];
      let expierence: number[];

  
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let account_types = await this.prisma.account_types.findUnique({
        where: {
          name: "Instructor",
        },
      });

      let userCount = await this.prisma.users.count({
        where: {
          account_type_id: account_types.id,
        },
      });

      let isFound: any = await this.prisma.users.findMany({
        where: {
          account_type_id: account_types.id,
          is_block: false,
          user_name: {
            contains: query.searchByText ?? undefined,
          },
          tutor_experiances: {
            some: {
              subject_id: {
                in: subjects,
              },
              // grade_id: {   to be set later
              //   in: grades,
              // },
              experty_level_id: {
                in: expierence,
              },
            },
          },
        },
        orderBy: [
          {
            per_hour_rate: query.orderBy === "DESC Name" ? "desc" : "asc",
          },
          {
            user_name: query.orderBy === "DESC Price" ? "desc" : "asc",
          },
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          bio: true,
          per_hour_rate: true,
          is_block: true
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
        throw new HttpException("Tutor Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let account_types = await this.prisma.account_types.findUnique({
        where: {
          name: "Instructor",
        },
      });
      let user: any = await this.prisma.users.findFirst({
        where: {
          id: id,
          account_type_id: account_types.id,
          is_block: false,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          user_name: true,
          email: true,
          per_hour_rate: true,
          bio: true,
          organizations: true,
          account_type_id: true,
          is_block: true,
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
          tutor_credentials: {
            select: {
              id: true,
              name: true,
            },
          },
          tutor_teaching_styles: {
            select: {
              tutor_teaching_styles: true
            }
          },
        },
      });
      if (user) {
        let attachments = await this.serviceFunction.getAttachments(
          user.id,
          "User"
        );
        user.attachments = attachments;

        user.tutor_experiances.map((item, index) => {
          item.grades = `${item.to_grade_id}-${item.from_grade_id}`;
          delete item.to_grade_id;
          delete item.from_grade_id
        })

        user.tutor_teaching_styles.map((item, index) => {
          if (item.tutor_teaching_styles) {
            item.id = item.tutor_teaching_styles?.id
            item.name = item.tutor_teaching_styles?.name
          }
          delete item.tutor_teaching_styles;
        })


        let InstructorLicenseFront = await this.serviceFunction.getAttachments(
          user.id,
          "InstructorLicenseFront"
        );
        user.InstructorLicenseFront = InstructorLicenseFront ? InstructorLicenseFront?.path : null;


        let InstructorLicenseBack = await this.serviceFunction.getAttachments(
          user.id,
          "InstructorLicenseBack"
        );
        user.InstructorLicenseBack = InstructorLicenseBack ? InstructorLicenseBack?.path : null;

        let InstructorResume = await this.serviceFunction.getAttachments(
          user.id,
          "InstructorResume"
        );
        user.InstructorResume = InstructorResume ? InstructorResume?.path : null;
        delete user.refresh_token;
        delete user.password;

        return response.status(HttpStatus.OK).json(user);
      } else {
        throw new HttpException("Instuctor not found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findSubjects(instructorId: number, response: Response) {
    try {
      let user = await this.prisma.users.findUnique({
        where: {
          id: instructorId
        }
      })

      if (user.account_type_id == 1) {
        let totalSubjects = await this.prisma.tutor_experiances.count({
          where: {
            instructor_id: user.account_type_id == 1 ? instructorId : undefined,
          },
        });
        let result = [];
        let subjects = await this.prisma.tutor_experiances.findMany({
          where: {
            instructor_id: instructorId ?? undefined,
          },
          select: {
            subjects: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        for (let item of subjects) {
          result.push(item.subjects);
        }
        if (result) {
          response.status(HttpStatus.OK).json({
            total: totalSubjects,
            data: result,
          });
        }
      } else {
        let result = await this.prisma.subjects.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        if (result) {
          response.status(HttpStatus.OK).json({
            total: result.length,
            data: result,
          });
        }
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async updateInstuctor(
    files: Express.Multer.File,
    instuctorId: number,
    dto: UpdateInstructorDto,
    response: Response
  ) {
    try {
      let images: any = files;
      let userExit = await this.prisma.users.findFirst({
        where: { id: instuctorId },
      });
      let isUpdated = await this.prisma.users.update({
        where: {
          id: instuctorId,
        },
        data: {
          first_name: dto.firstName ?? userExit.first_name,
          last_name: dto.lastName ?? userExit.last_name,
          email: dto.email ?? userExit.email,
          user_name: dto.userName ?? userExit.user_name,
          bio: dto.bio ?? userExit.bio,
          per_hour_rate: dto.hourlyRate ?? userExit.per_hour_rate,
        },
      });
      await Promise.all([
        dto.userexpirence
          ? this.updateTutorExperience(instuctorId, dto.userexpirence)
          : null,
        dto.credentails
          ? this.updateTutoCredentials(instuctorId, dto.credentails)
          : null,
        dto.teachingStyle
          ? this.updateTutorTeachingStyle(instuctorId, dto.teachingStyle)
          : null,
      ]);

      if (isUpdated) {
        delete isUpdated.password;

        if (dto.isDrivingLicenseFrontDeleted) {
          let attachment = await this.prisma.attachments.findFirst({
            where: {
              attachmentable_id: isUpdated.id,
              attachmentable_type: 'InstructorLicenseFront',
            },
            select: {
              id: true,
            },
          });
          await this.prisma.attachments.delete({
            where: {
              id: attachment.id
            }
          })
        }
        if (dto.isDrivingLicenseBackDeleted) {
          let attachment = await this.prisma.attachments.findFirst({
            where: {
              attachmentable_id: isUpdated.id,
              attachmentable_type: 'InstructorLicenseBack',
            },
            select: {
              id: true,
            },
          });
          await this.prisma.attachments.delete({
            where: {
              id: attachment.id
            }
          })
        }

        if (dto.isResumeDeleted) {
          let attachment = await this.prisma.attachments.findFirst({
            where: {
              attachmentable_id: isUpdated.id,
              attachmentable_type: 'InstructorResume',
            },
            select: {
              id: true,
            },
          });
          await this.prisma.attachments.delete({
            where: {
              id: attachment.id
            }
          })
        }



        response.status(HttpStatus.OK).json(isUpdated);

        // uploading profile picture
        if (images?.avator) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.avator[0].destination}/${images.avator[0].filename}`,
            fileName: images.avator[0].filename,
            modelName: "User",
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        }
        // uploading license front
        if (images?.InstructorLicenseFront) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.InstructorLicenseFront[0].destination}/${images.InstructorLicenseFront[0].filename}`,
            fileName: images.InstructorLicenseFront[0].filename,
            modelName: "InstructorLicenseFront",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
        // uploading license Back
        if (images?.InstructorLicenseBack) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.InstructorLicenseBack[0].destination}/${images.InstructorLicenseBack[0].filename}`,
            fileName: images.InstructorLicenseBack[0].filename,
            modelName: "InstructorLicenseBack",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
        // uploading Resume
        if (images?.InstructorResume) {
          let eventData = {
            modelId: isUpdated.id,
            path: `${images.InstructorResume[0].destination}/${images.InstructorResume[0].filename}`,
            fileName: images.InstructorResume[0].filename,
            modelName: "InstructorResume",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateTutorExperience(tutorId: number, experience: TutorExpierencedto[]) {
    try {
      await this.prisma.tutor_experiances.deleteMany({
        where: {
          instructor_id: tutorId,
        },
      });

      for (const item of experience) {
        let from_grade_id = Number.parseInt(item.grades.split('-')[0])
        let to_grade_id = Number.parseInt(item.grades.split('-')[1])
        await this.prisma.tutor_experiances.create({
          data: {
            instructor_id: tutorId,
            to_grade_id: to_grade_id,
            from_grade_id: from_grade_id,
            subject_id: item.subjectId,
            experty_level_id: item.expeirenceLevelId,
          },
        });
      }

    } catch (error) {
      console.log(error);
    }
  }

  async updateTutorTeachingStyle(
    tutorId: number,
    techingStyles: TutorteachingStyleDto[]
  ) {
    try {
      await this.prisma.tutor_teaching_styles.deleteMany({
        where: {
          instructor_id: tutorId,
        },
      });

      techingStyles.map(async (item: TutorteachingStyleDto, index) => {
        await this.prisma.tutor_teaching_styles.create({
          data: {
            instructor_id: tutorId,
            teaching_style_id: item.teaching_style_id
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  async updateTutoCredentials(
    tutorId: number,
    credentials: TutorCredentailsDto[]
  ) {
    try {
      await this.prisma.tutor_credentials.deleteMany({
        where: {
          instructor_id: tutorId,
        },
      });

      credentials.map(async (item: TutorCredentailsDto, index) => {
        await this.prisma.tutor_credentials.create({
          data: {
            instructor_id: tutorId,
            name: item.credentails,
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async disableTutor(id: number, response: Response) {
    try {
      let userExit = await this.prisma.users.findFirst({
        where: {
          id: id,
          account_types: {
            name: "Instructor",
          },
        },
      });
      if (userExit) {
        let isUpdated = await this.prisma.users.update({
          where: {
            id: id,
          },
          data: {
            is_block: !userExit.is_block,
          },
        });
        return response.status(HttpStatus.OK).json({
          status: isUpdated.is_block ? "User Disabled Succussfully!!" : "User Enabled Succussfully!!",
        });
      } else {
        throw new HttpException("Instuctor not found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async graph1(id: number, response: Response) {
    try {

      let org_user = await this.prisma.users.findUnique({ where: { id: id } })

      let learnerCount = 0;
      let content_Session_Id = [];
      if (org_user.is_independent) {
  
        learnerCount = await this.prisma.user_manager.count({
          where: {
            manager_id: id
          }
        })
      } else {

        let gradesArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

        let account_types = await this.prisma.account_types.findUnique({
          where: {
            name: "Learner",
          },
        });

        let Sessions = await this.prisma.instructor_sessions.findMany({
          where: {
            instructor_id: id,
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

        learnerCount = await this.prisma.users.count({
          where: {
            account_type_id: account_types.id,
            organization_id: org_user.organization_id,
            learner_details: {
              some: {
                to_grade_id: { in: gradesArr },
                from_grade_id: { in: gradesArr }
              }
            },
            learner_courses: {
              some: {
                content_session_id: {
                  in: content_Session_Id
                }
              }
            }
          }
        });
      }

      let isorganizationFound = await this.prisma.contents.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  instructor_id: id,
                },
                {
                  content_sessions_content_sessions_session_idTocontents: {
                    some: {
                      id: { in: content_Session_Id }
                    }
                  }
                }
              ]
            },
            {
              content_types: {
                title: 'Session'
              },
            }
          ]
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
          labels, data, learnerCount
        });
      } else {
        throw new HttpException("organization Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async InstructoralllearnersOnDashboard(query: InstructorDashbaordQuery, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let instructorcourseList = [];
      const instructorcourseKeyMap = new Map();

      let startGrade = query.grades ? +query.grades.split("-")[0] : 1
      let endGrade = query.grades ? +query.grades.split("-")[1] : 12
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: startGrade,
            lte: endGrade
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let isOrg = await this.prisma.users.findUnique({ where: { id: query.instructorId } })

      if (isOrg.is_independent) {

        let learnerCount = await this.prisma.user_manager.count({
          where: {
            manager_id: query.instructorId,
            users_user_manager_user_idTousers: {
              user_name: {
                contains: query.searchbytext ?? undefined
              },
              learner_details: {
                some: {
                  AND: [
                    { to_grade_id: { in: gradesArr } },
                    { from_grade_id: { in: gradesArr } },
                  ],
                },
              },
              learner_courses:
                query.courseId ? {
                  some: {
                    course_id: query.courseId ?? undefined,
                  }
                } : { every: { course_id: undefined } }
            }
          },
        });

        let allLearners: any = await this.prisma.user_manager.findMany({
          where: {
            manager_id: query.instructorId,
            users_user_manager_user_idTousers: {
              user_name: {
                contains: query.searchbytext ?? undefined
              },
              learner_details: {
                some: {
                  AND: [
                    { to_grade_id: { in: gradesArr } },
                    { from_grade_id: { in: gradesArr } },
                  ],
                },
              },
              learner_courses:
                query.courseId ? {
                  some: {
                    course_id: query.courseId ?? undefined,
                  }
                } : { every: { course_id: undefined } }
            }
          },
          orderBy: [
            query.orderBy === "Latest Learner" ? {
              id: "desc",
            } : null,
            query.orderBy === "Oldest Learner" ? {
              id: "asc"
            } : null,
          ],
          skip: pageNo * limit,
          take: query?.limit,
          select: {
            users_user_manager_user_idTousers: {
              select: {
                id: true,
                user_name: true,
                first_name: true,
                last_name: true,
                email: true,
                learner_details: {
                  select: {
                    to_grade_id: true,
                    from_grade_id: true,
                    date_of_birth: true,
                  }
                },
                learner_courses: {
                  select: {
                    contents: {
                      select: {
                        id: true,
                        title: true,
                        is_active: true,
                      }
                    }
                  }
                },
                learner_pathways: {
                  select: {
                    pathways: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            },
          }
        });

        if (allLearners) {
          for (const item of allLearners) {
            let learner_id = item.users_user_manager_user_idTousers.id;
            item.id = item.users_user_manager_user_idTousers.id;
            item.user_name = item.users_user_manager_user_idTousers.user_name;
            item.first_name = item.users_user_manager_user_idTousers.first_name;
            item.last_name = item.users_user_manager_user_idTousers.last_name;
            item.email = item.users_user_manager_user_idTousers.email;
            let attachments = await this.serviceFunction.getAttachments(
              item.users_user_manager_user_idTousers.id,
              "User"
            );
            item.image_url = attachments?.path;
            item.learner_details = item.users_user_manager_user_idTousers.learner_details;
            item.learner_pathways = item.users_user_manager_user_idTousers.learner_pathways;

            let learner_courses = [];

            for (const courseList of item.users_user_manager_user_idTousers.learner_courses) {

              let grades = [];
              let totalquiz = 0;
              let quizFound = 0;
              let totalassignment = 0;
              let assignmentFound = 0;
              let totalquest = 0;
              let questFound = 0;
              let totalactivities = 0;
              let course_id = courseList.contents.id;
              let course = await this.prisma.contents.findFirst({
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
                      interactives: {
                        select: {
                          id: true,
                          title: true,
                          interactive_types_interactives_interactive_type_idTointeractive_types: {
                            select: {
                              name: true
                            }
                          }
                        }
                      },
                      content_interactive_segment_sessions: true
                    }
                  },
                  content_module_segments: {
                    select: {
                      id: true,
                      module: true,
                      start_date: true,
                      end_date: true,
                      content_module_segment_activities: {
                        select: {
                          id: true,
                          content_activity_id: true,
                          contents_content_module_segment_activities_content_activity_idTocontents: {
                            select: {
                              id: true,
                              title: true,
                            }
                          }
                        }
                      }
                    }
                  },
                },
              });





              if (course) {

                const key = `${course.id}-${course.title}`;
                if (!instructorcourseKeyMap.has(key)) {
                  instructorcourseKeyMap.set(key, true);
                  instructorcourseList.push({
                    id: course.id,
                    name: course.title
                  })
                }

                for (const item of course?.content_interactive_segments) {

                  if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
                    totalquiz++;
                    let isquizFound = await this.prisma.interactive_quiz_results.findFirst({
                      where: {
                        learner_id: learner_id,
                        interactive_id: item?.interactives.id
                      },
                    })


                    if (isquizFound) {
                      quizFound++
                      grades.push({
                        id: item?.interactives.id,
                        type: 'Quiz',
                        title: item?.interactives.title,
                        marks: isquizFound.marks,
                        submittedDate: isquizFound.created_at
                      })
                    }
                  } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
                    totalquest++
                    let isQuertFound = await this.prisma.interactive_quest_submissions.findFirst({
                      where: {
                        learner_id: learner_id,
                        interactive_id: item?.interactives.id
                      }
                    })
                    if (isQuertFound) {
                      questFound++
                      grades.push({
                        id: item?.interactives.id,
                        type: 'Quest',
                        title: item?.interactives.title,
                        marks: isQuertFound.marks,
                        submittedDate: isQuertFound.created_at
                      })
                    }
                  } else {
                    totalassignment++
                    let isAssignmentFound = await this.prisma.interactive_assignment_submissions.findFirst({
                      where: {
                        learner_id: learner_id,
                        interactive_id: item?.interactives.id
                      }
                    })
                    if (isAssignmentFound) {
                      questFound++
                      grades.push({
                        id: item?.interactives.id,
                        type: 'Assignment',
                        title: item?.interactives.title,
                        marks: isAssignmentFound.obtained_marks,
                        submittedDate: isAssignmentFound.created_at
                      })
                    }
                  }
                }

                for (const _activities of course?.content_module_segments) {
                  for (const item of _activities.content_module_segment_activities) {
                    totalactivities++;
                  }
                }
              }
              let grade;
              let found = quizFound + questFound + assignmentFound;
              let total = totalquiz + totalquest + totalassignment;
              if (found != 0 && total != 0) {
                grade = (found / total) * 100
              } else {
                grade = 0
              }



              learner_courses.push({
                courseName: courseList.contents.title,
                active: courseList.contents.is_active,
                quiz: `${quizFound}/${totalquiz}`,
                assignment: `${assignmentFound}/${totalassignment}`,
                quest: `${questFound}/${totalquest}`,
                activities: totalactivities,
                grade: `${parseFloat(grade.toFixed(2))} %`,
                progress: `${parseFloat(grade.toFixed(2))} %`,
                grades: grades
              })
            }

            item.learner_courses = learner_courses
            delete item.users_user_manager_user_idTousers;
          }

          response.status(HttpStatus.OK).json({
            total: learnerCount,
            limit: limit,
            offset: pageNo,
            data: allLearners,
            courses: instructorcourseList
          });
        } else {
          throw new HttpException(
            "learner Not Found!!",
            HttpStatus.NOT_FOUND
          );
        }
      } else {

        // organization Learners
        let content_Session_Id = [];

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
        
        let learnerCount = await this.prisma.users.count({
          where: {
            organization_id: isOrg.organization_id,
            user_name: {
              contains: query.searchbytext ?? undefined
            },
            learner_details: {
              some: {
                AND: [
                  { to_grade_id: { in: gradesArr } },
                  { from_grade_id: { in: gradesArr } },
                ],
              },
            },
            learner_courses:
              query.courseId ? {
                some: {
                  course_id: query.courseId ?? undefined,
                  content_session_id: {
                    in: content_Session_Id
                  }
                }
              } : {
                some: {
                  content_session_id: {
                    in: content_Session_Id
                  }
                }
              }
          }
        });

        let allLearners: any = await this.prisma.users.findMany({
          where: {
            organization_id: isOrg.organization_id,
            user_name: {
              contains: query.searchbytext ?? undefined
            },
            learner_details: {
              some: {
                AND: [
                  { to_grade_id: { in: gradesArr } },
                  { from_grade_id: { in: gradesArr } },
                ],
              },
            },
            learner_courses:
              query.courseId ? {
                some: {
                  course_id: query.courseId ?? undefined,
                  content_session_id: {
                    in: content_Session_Id
                  }
                }
              } : {
                some: {
                  content_session_id: {
                    in: content_Session_Id
                  }
                }
              }
          },
          orderBy: [
            query.orderBy === "Latest Learner" ? {
              id: "desc",
            } : null,
            query.orderBy === "Oldest Learner" ? {
              id: "asc"
            } : null,
          ],
          skip: pageNo * limit,
          take: query?.limit,
          select: {
            id: true,
            user_name: true,
            first_name: true,
            last_name: true,
            email: true,
            learner_details: {
              select: {
                to_grade_id: true,
                from_grade_id: true,
                date_of_birth: true,
              }
            },
            learner_courses: {
              select: {
                progress: true,
                content_session_id: true,
                contents: {
                  select: {
                    id: true,
                    title: true,
                    is_active: true,
                  }
                }
              }
            },
            learner_pathways: {
              select: {
                pathways: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        });

        if (allLearners) {
          for (const item of allLearners) {
            let learner_id = item.id;
            item.id = item.id;
            item.user_name = item.user_name;
            item.first_name = item.first_name;
            item.last_name = item.last_name;
            item.email = item.email;
            let attachments = await this.serviceFunction.getAttachments(
              item.id,
              "User"
            );
            item.image_url = attachments?.path;
            item.learner_details = item.learner_details;
            item.learner_pathways = item.learner_pathways;

            let learner_courses = [];

            for (const courseList of item.learner_courses) {

              if (content_Session_Id.includes(courseList.content_session_id)!) {

                let grades = [];
                let totalquiz = 0;
                let quizFound = 0;
                let totalassignment = 0;
                let assignmentFound = 0;
                let totalquest = 0;
                let questFound = 0;
                let totalactivities = 0;
                let course_id = courseList.contents.id;
                let course = await this.prisma.contents.findFirst({
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
                        interactives: {
                          select: {
                            id: true,
                            title: true,
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
                        content_module_segment_activities: {
                          select: {
                            id: true,
                            content_activity_id: true,
                            contents_content_module_segment_activities_content_activity_idTocontents: {
                              select: {
                                id: true,
                                title: true,
                              }
                            }
                          }
                        }
                      }
                    },
                  },
                });


                if (course) {

                  const key = `${course?.id}-${course?.title}`;
                  if (!instructorcourseKeyMap.has(key)) {
                    instructorcourseKeyMap.set(key, true);
                    instructorcourseList.push({
                      id: course.id,
                      name: course.title
                    })
                  }

                  for (const item of course?.content_interactive_segments) {
                    if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quiz") {
                      totalquiz++;
                      let isquizFound = await this.prisma.interactive_quiz_results.findFirst({
                        where: {
                          learner_id: learner_id,
                          interactive_id: item?.interactives.id
                        },

                      })
                      if (isquizFound) {
                        quizFound++
                      }

                      grades.push({
                        id: item?.interactives.id,
                        type: 'Quiz',
                        title: item?.interactives.title,
                        marks: isquizFound?.marks ?? null,
                        submittedDate: isquizFound?.created_at ?? null
                      })
                    } else if (item?.interactives.interactive_types_interactives_interactive_type_idTointeractive_types.name === "Quest") {
                      totalquest++
                      let isQuertFound = await this.prisma.interactive_quest_submissions.findFirst({
                        where: {
                          learner_id: learner_id,
                          interactive_id: item?.interactives.id
                        },
                      })
                      if (isQuertFound) {
                        questFound++
                      }
                      grades.push({
                        id: item?.interactives.id,
                        type: 'Quest',
                        title: item?.interactives.title,
                        marks: isQuertFound?.marks ?? null,
                        submittedDate: isQuertFound?.submission_date ?? null
                      })
                    } else {
                      totalassignment++
                      let isAssignmentFound = await this.prisma.interactive_assignment_submissions.findFirst({
                        where: {
                          learner_id: learner_id,
                          interactive_id: item?.interactives.id
                        }
                      })
                      if (isAssignmentFound) {
                        questFound++
                      }

                      grades.push({
                        id: item?.interactives.id,
                        type: 'Assignment',
                        title: item?.interactives.title,
                        marks: isAssignmentFound?.obtained_marks ?? null,
                        submittedDate: isAssignmentFound?.submission_date ?? null
                      })
                    }
                  }

                  for (const _activities of course?.content_module_segments) {
                    for (const item of _activities.content_module_segment_activities) {
                      totalactivities++;
                    }
                  }
                }

                learner_courses.push({
                  courseName: courseList.contents.title,
                  active: courseList.contents.is_active,
                  quiz: `${quizFound}/${totalquiz}`,
                  assignment: `${assignmentFound}/${totalassignment}`,
                  quest: `${questFound}/${totalquest}`,
                  activities: totalactivities,
                  grade: courseList.progress,
                  progress: courseList.progress,
                  grades: grades
                })
              }
            }

            item.learner_courses = learner_courses
          }

          response.status(HttpStatus.OK).json({
            total: learnerCount,
            limit: limit,
            offset: pageNo,
            data: allLearners,
            courses: instructorcourseList
          });
        } else {
          throw new HttpException(
            "learner Not Found!!",
            HttpStatus.NOT_FOUND
          );
        }
      }




    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async Instructoralllearners(query: InstructorAllLearnerQuery, response: Response) {
    try {



      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let learnerCount = await this.prisma.user_manager.count({
        where: {
          manager_id: query.instructorId
        },
      });

      let allLearners: any = await this.prisma.user_manager.findMany({
        where: {
          manager_id: query.instructorId,
        },
        orderBy: [
          query.orderBy === "Latest Learner" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Learner" ? {
            id: "asc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          users_user_manager_user_idTousers: {
            select: {
              id: true,
              user_name: true,
              first_name: true,
              last_name: true,
              email: true,
              is_block: true,
              learner_details: {
                select: {
                  to_grade_id: true,
                  from_grade_id: true,
                  date_of_birth: true,
                }
              },
            }
          },
        }
      });
      if (allLearners) {
        for (const item of allLearners) {

          item.id = item.users_user_manager_user_idTousers.id;
          item.user_name = item.users_user_manager_user_idTousers.user_name;
          item.first_name = item.users_user_manager_user_idTousers.first_name;
          item.last_name = item.users_user_manager_user_idTousers.last_name;
          item.email = item.users_user_manager_user_idTousers.email;
          item.is_block = item.users_user_manager_user_idTousers.is_block
          item.learner_details = item.users_user_manager_user_idTousers.learner_details;
          let attachments = await this.serviceFunction.getAttachments(
            item.users_user_manager_user_idTousers.id,
            "User"
          );
          item.image_url = attachments?.path ?? null;
          delete item.users_user_manager_user_idTousers;
        }

        response.status(HttpStatus.OK).json({
          total: learnerCount,
          limit: limit,
          offset: pageNo,
          data: allLearners,
        });
      } else {
        throw new HttpException(
          "Learner Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async InstructorallSession(query: InstructorAllSessionQuery, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let isOrg = await this.prisma.users.findUnique({ where: { id: query.instructorId } })
      let instructorcourseList = [];
      const instructorcourseKeyMap = new Map();
      let startGrade = query.grades ? +query.grades.split("-")[0] : 1
      let endGrade = query.grades ? +query.grades.split("-")[1] : 13
      let gradesArr: any = await this.prisma.grades.findMany({
        where: {
          id: {
            gte: startGrade,
            lte: endGrade
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let learnerCount = await this.prisma.contents.count({
        where: {
          AND: [
            {
              OR: [
                {
                  instructor_id: query.instructorId,
                },
                {
                  instructor_sessions: isOrg.is_independent ? undefined : {
                    some: {
                      instructor_id: query.instructorId
                    }
                  }
                }
              ]
            },
            {
              content_types: {
                title: 'Session'
              },
              title: {
                contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
              },
              content_sessions_content_sessions_session_idTocontents: {
                every: {
                  course_id: query.courseId ?? undefined,
                }
              },
              to_grade_id: {
                in: gradesArr
              },
              from_grade_id: {
                in: gradesArr
              }
            }
          ]


        },
      });


      let allsession: any = await this.prisma.contents.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  instructor_id: query.instructorId,
                },
                {
                  instructor_sessions: isOrg.is_independent ? undefined : {
                    some: {
                      instructor_id: query.instructorId
                    }
                  }
                }
              ]
            },
            {
              content_types: {
                title: 'Session'
              },
              title: {
                contains: query?.searchbytext ? query.searchbytext.trim() : undefined,
              },
              content_sessions_content_sessions_session_idTocontents: {
                every: {
                  course_id: query.courseId ?? undefined,
                }
              },
              to_grade_id: {
                in: gradesArr
              },
              from_grade_id: {
                in: gradesArr
              }
            }
          ]
        },
        orderBy: [
          query.orderBy === "Latest Session" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Session" ? {
            id: "asc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          id: true,
          title: true,
          content_description: true,
          to_grade_id: true,
          from_grade_id: true,
          is_active: true,
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
              contents_content_sessions_course_idTocontents: {
                select: {
                  id: true,
                  title: true,
                }
              }
            },
          },
        }
      });

      if (allsession) {
        for (const item of allsession) {
          let course_id = item.content_sessions_content_sessions_session_idTocontents[0]?.course_id;
          let content_session_id = item.content_sessions_content_sessions_session_idTocontents[0]?.id;

          const key = `${item.content_sessions_content_sessions_session_idTocontents[0]?.contents_content_sessions_course_idTocontents?.id}-${item.content_sessions_content_sessions_session_idTocontents[0]?.contents_content_sessions_course_idTocontents?.title}`;
          if (!instructorcourseKeyMap.has(key)) {
            instructorcourseKeyMap.set(key, true);
            instructorcourseList.push({
              id: item.content_sessions_content_sessions_session_idTocontents[0]?.contents_content_sessions_course_idTocontents?.id,
              name: item.content_sessions_content_sessions_session_idTocontents[0]?.contents_content_sessions_course_idTocontents?.title
            })
          }

          if (course_id && content_session_id) {
            let session_learner = await this.prisma.learner_courses.findMany({
              where: {
                AND: {
                  course_id: course_id,
                  content_session_id: content_session_id
                }
              }
            })
            item.start_date = item?.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0]?.start_date;
            item.end_date = item?.content_sessions_content_sessions_session_idTocontents[0].content_session_details[0]?.start_date;
            item.Learners = `${session_learner.length}/50`;
          } else {
            item.start_date = null;
            item.end_date = null;
            item.Learners = `0/50`;
          }
          delete item.content_sessions_content_sessions_session_idTocontents
        }

        response.status(HttpStatus.OK).json({
          total: learnerCount,
          limit: limit,
          offset: pageNo,
          data: allsession,
          courses: instructorcourseList
        });
      } else {
        throw new HttpException(
          "Session Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }




}
