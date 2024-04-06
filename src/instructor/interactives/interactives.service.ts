import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import {
  CreateInteractiveDto,
  PublishInteractive,
  SearchInteractive,
  FindInteractiveByArray,
  FindLearnerInteractive,
  DuplicateInteractive,
  interactiveSubjectQuery,
} from "./dto/create-interactive.dto";
import { UpdateInteractiveDto } from "./dto/update-interactive.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { CommonFunctionsService } from "src/services/commonService";
import { id } from "date-fns/locale";
import { InteractiveType } from "src/admin/interactive-types/entities/interactive-type.entity";
import { concat } from "rxjs/operators";

@Injectable()
export class InteractivesService {
  constructor(
    private readonly prismaService: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(
    files: Express.Multer.File,
    dto: CreateInteractiveDto,
    response: Response
  ) {
    try {
      let video: any = files;
      let questionArray: any;
      let subjectArray: any;

      let interactiveType = await this.prismaService.interactive_types.findUnique({
        where: {
          id: dto.interactive_type_id
        }
      })
      if (!interactiveType) {

        throw new HttpException(
          "Interactive id is not valid",
          HttpStatus.BAD_REQUEST
        );

      }
      if (dto.questions) {
        let questionString: any = dto.questions;
        questionArray = JSON.parse(questionString); // Parse the JSON and extract the inner array
      } else {
        questionArray = null;
      }
      if (dto.subjects) {
        let subjectString: any = dto.subjects;
        subjectArray = JSON.parse(subjectString); // Parse the JSON and extract the inner array
      } else {
        questionArray = null;
      }
      let user = await this.prismaService.users.findUnique({
        where: {
          id: dto.instructor_id,
        },
        select: {
          account_types: {
            select: {
              name: true,
            },
          },
        },
      });
      if (user.account_types.name != "Organzation") {
        if (subjectArray) {
          const checkExperinceSubjects: any = await this.checkSubject(
            dto.instructor_id,
            subjectArray
          );
          if (checkExperinceSubjects != true) {
            return response
              .status(HttpStatus.OK)
              .json({ message: checkExperinceSubjects });
          }
        }
      }
      let userOragnization = await this.prismaService.users.findUnique({
        where: {
          id: dto.instructor_id,
        },
        select: {
          organization_id: true,
        },
      });
      const createInteractives = await this.prismaService.interactives.create({
        data: {
          title: dto.title,
          description: dto.description,
          from_grade_id: dto.from_grade_id,
          to_grade_id: dto.to_grade_id,
          duration: dto.duration,
          interactive_type_id: dto.interactive_type_id,
          instructor_id: dto.instructor_id,
          organization_id: userOragnization.organization_id,
          isDraft: dto.isdraft ?? false,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      });
      if (createInteractives) {
        await this.addSubjects(
          subjectArray,
          questionArray,
          createInteractives.id
        );

        response.status(HttpStatus.OK).json("New Interactives Added");
        let eventData = {};
        if (video.interactiveAttachment) {
          eventData = {
            modelId: createInteractives.id,
            path: video.interactiveAttachment[0].path,
            fileName: video.interactiveAttachment[0].filename,
            modelName: "Interactives",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
      } else {
        throw new HttpException(
          "Interactives Not Added",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {

      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchInteractive, response: Response) {
    try {

      let interactiveType = await this.prismaService.interactive_types.findUnique({
        where: {
          id: query.InteractiveTypeId
        }
      })
      if (!interactiveType) {

        throw new HttpException(
          "Interactive id is not valid",
          HttpStatus.BAD_REQUEST
        );

      }

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let gradesArr: any = await this.prismaService.grades.findMany({
        where: {
          id: {
            gte: query.startGrade ?? 1,
            lte: query.endGrade ?? 13,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });
      gradesArr = gradesArr.map((grade) => grade.id);

      let user = await this.prismaService.users.findUnique({
        where: {
          id: query.instuctorId,
        },
      });
      let org_content = await this.prismaService.organization_contents.findFirst({
        where: {
          organization_id: user.organization_id
        }
      })
      let org_content_grade: any = await this.prismaService.grades.findMany({
        where: {
          id: {
            gte: org_content?.from_grade_id,
            lte: org_content?.to_grade_id,
          },
        },
        select: {
          id: true, // Only select the ID field
        },
      });

      org_content_grade = org_content_grade.map((grade) => grade.id);



      let InteractiveType =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: query.InteractiveTypeId,
          },
        });
      let InteractiveCount = await this.prismaService.interactives.count({
        where: {
          is_active: true,
          OR: [
            {
              OR:
                [
                  {
                    instructor_id: user.account_type_id === 4 ? undefined : query.instuctorId,
                  },
                  user.account_type_id === 4 ? undefined : {
                    instructor_interactives: {
                      some: {
                        instructor_id: query.instuctorId
                      }
                    }
                  }
                ]
            },
            {
              OR: [
                org_content ? {
                  to_grade_id: {
                    in: org_content_grade
                  },
                  from_grade_id: {
                    in: org_content_grade
                  },
                  interactive_type_id: InteractiveType.id,
                  organization_id: 6,
                  interactive_subjects: {
                    some: {
                      subject_id: query.subjectsId ?? undefined,
                    },
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  },
                } : {},
                {
                  interactive_type_id: InteractiveType.id ?? undefined,
                  organization_id: user.organization_id,
                 
                  from_grade_id: {
                    in: gradesArr,
                  },
                  to_grade_id: {
                    in: gradesArr,
                  },
                }
              ]
            }

          ]
        },
      });

      const interactives: any = await this.prismaService.interactives.findMany({
        where: {
          is_active: true,
          OR: [
            {
              OR:
                [
                  {
                    instructor_id: user.account_type_id === 4 ? undefined : query.instuctorId,
                  },
                  user.account_type_id === 4 ? undefined : {
                    instructor_interactives: {
                      some: {
                        instructor_id: query.instuctorId
                      }
                    }
                  }
                ]
            },
            {
              OR: [
                org_content ? {
                  to_grade_id: {
                    in: org_content_grade
                  },
                  from_grade_id: {
                    in: org_content_grade
                  },
                  interactive_type_id: InteractiveType.id,
                  organization_id: 6,
                  interactive_subjects: {
                    some: {
                      subject_id: query.subjectsId ?? undefined,
                    },
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  },
                } : {},

                {
                  interactive_type_id: InteractiveType.id ?? undefined,
                  organization_id: user.organization_id,
                  interactive_subjects: {
                    some: {
                      subject_id: query.subjectsId ?? undefined,
                    },
                  },
                  title: {
                    contains: query?.searchByText ? query.searchByText.trim() : undefined
                  },
                  from_grade_id: {
                    in: gradesArr,
                  },
                  to_grade_id: {
                    in: gradesArr,
                  },
                }
              ]
            }
          ]
        },
        orderBy: [
          {
            id: query.orderBy === "Latest" ? "desc" : "asc",
          },
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          from_grade_id: true,
          to_grade_id: true,
          isDraft: true,
          is_active: true,
          users: {
            select: {
              id: true,
              user_name: true,
              organization_id: true
            }
          },
          interactive_subjects: {
            select: {
              subjects: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      if (InteractiveType.name === "Quest") {
        for (const item of interactives) {
          let attachments: any = await this.serviceFunction.getAttachments(
            item.id,
            "Interactives"
          );
          item.attachments = attachments;
        }
      }
      for (let item of interactives) {
        let InstructorAttachments: any = await this.serviceFunction.getAttachments(
          item.users.id,
          "User"
        );
        item.users.InstructorAttachments = InstructorAttachments?.path;
      }
      let interactiveTypeName =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: query.InteractiveTypeId,
          },
        });
      if (interactives.length > 0) {
        if (interactiveTypeName.name !== "Quest") {
          for (const key of interactives) {
            let interactiveSubjects: any =
              await this.prismaService.interactive_subjects.findMany({
                where: {
                  interactive_id: key.id,
                },
              });
            let totalQuestion = [];
            let questionIds = [];

            for (const item of interactiveSubjects) {
              let questions =
                await this.prismaService.question_interactive_subjects.findMany(
                  {
                    where: {
                      interactive_subject_id: item.id,
                    },
                  }
                );
              for (let item of questions) {
                questionIds.push(item.question_id);
              }
              totalQuestion = Array.from(new Set(questionIds));
            }
            key.totalQuestions = totalQuestion.length;
          }
        }
      }
      for (let item of interactives) {
        let session = await this.prismaService.contents.findMany({
          where: {
            content_interactive_segments: {
              some: {
                interactive_id: item.id,
              },
            },
          },
          select: {
            content_sessions_content_sessions_course_idTocontents: {
              select: {
                session_id: true
              }
            }
          },
        });

        let attachedSessions = []

        for (let content of session) {
          for (let content_session of content.content_sessions_content_sessions_course_idTocontents) {
            let find_session_Name = await this.prismaService.contents.findUnique({
              where: {
                id: content_session.session_id
              },
              select: {
                id: true,
                title: true
              }
            })
            attachedSessions.push(find_session_Name)
          }
        }
        item.sessionAttached = attachedSessions;
      }

      if (interactives.length > 0) {
        return response.status(HttpStatus.OK).json({
          total: InteractiveCount,
          limit: limit,
          offset: pageNo,
          data: interactives,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          total: InteractiveCount,
          limit: limit,
          offset: pageNo,
          data: interactives,
        });
      }
    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const interactive: any = await this.prismaService.interactives.findUnique(
        {
          where: {
            id: id,
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            interactive_type_id: true,
            from_grade_id: true,
            to_grade_id: true,
            users: {
              select: {
                id: true,
                user_name: true,
                organization_id: true
              }
            },
            interactive_subjects: {
              select: {
                id: true,
                subjects: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                question_interactive_subjects: {
                  select: {
                    questions: {
                      select: {
                        id: true,
                        question: true,
                        points: true,
                        question_skills:true,
                        question_options: {
                          select: {
                            id: true,
                            answer: true,
                            is_correct: true,
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
      );

      const InteractiveSubjects = interactive.interactive_subjects;

      let questAttachments = await this.serviceFunction.getAttachments(
        interactive.id,
        "Interactives"
      );

      interactive.attachment = questAttachments;
      let InstructorAttachments = await this.serviceFunction.getAttachments(
        interactive.users.id,
        "User"
      );

      interactive.users.InstructorAttachments = InstructorAttachments;

      let questionIds = [];
      for (const item of InteractiveSubjects) {
        for (const newItem of item.question_interactive_subjects) {
          let QuestionId = newItem.questions.id;
          questionIds.push(QuestionId);
        }
      }

      // Sort the array in ascending order
      questionIds.sort((a, b) => a - b);

      // Create a new array to hold the distinct values
      const distinctArr = [];

      // Iterate through the sorted array and add distinct values to the new array
      for (let i = 0; i < questionIds.length; i++) {
        if (questionIds[i] !== questionIds[i - 1]) {
          distinctArr.push(questionIds[i]);
        }
      }
      let questionFinalArray = new Array();
      for (const item of distinctArr) {
        const questionsAndOptions =
          await this.prismaService.questions.findFirst({
            where: {
              id: item,
            },
            select: {
              id: true,
              question: true,
              points: true,
              question_skills:true,
              question_options: {
                select: {
                  id: true,
                  answer: true,
                  is_correct: true,
                },
              },
            },
          });
        if (questionsAndOptions) {
          questionFinalArray.push(questionsAndOptions);
        }
      }
  
      for (const item of questionFinalArray) {
        let QuestionId = item.id;
        let questionAttachment = await this.serviceFunction.getAttachments(
          QuestionId,
          "Questions"
        );
        item.attachment = questionAttachment;
        for (const newItem of item.question_options) {
          let OptionId = newItem.id;
          let optionAttachment = await this.serviceFunction.getAttachments(
            OptionId,
            "Options"
          );
          newItem.attachments = optionAttachment;
        }
      }
      let interactiveType =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: interactive.interactive_type_id,
          },
        });
      delete interactive.interactive_subjects;
      for (const item of InteractiveSubjects) {
        delete item.question_interactive_subjects;
      }
      interactive.subjects = InteractiveSubjects;
      interactive.questions = questionFinalArray;

      if (interactiveType.name === "Quest") {
        delete interactive.questions;
      }
      let session = await this.prismaService.contents.findMany({
        where: {
          content_interactive_segments: {
            some: {
              interactive_id: interactive.id,
            },
          },
        },
        select: {
          content_sessions_content_sessions_course_idTocontents: {
            select: {
              session_id: true
            }
          }
        },
      });

      let attachedSessions = []

      for (let content of session) {
        for (let content_session of content.content_sessions_content_sessions_course_idTocontents) {
          let find_session_Name = await this.prismaService.contents.findUnique({
            where: {
              id: content_session.session_id
            },
            select: {
              id: true,
              title: true,

            }
          })
          attachedSessions.push(find_session_Name)
        }
      }
      interactive.sessionAttached = attachedSessions;

      if (interactive) {
        return response.status(HttpStatus.OK).json({
          data: interactive,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          data: interactive,
        });
      }
    } catch (error) {
      console.error(error);
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async duplicateInteractive(dto: DuplicateInteractive, response: Response) {
    try {
      const interactive: any = await this.prismaService.interactives.findUnique(
        {
          where: {
            id: dto.interactive_id,
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            interactive_type_id: true,
            from_grade_id: true,
            to_grade_id: true,
            users: {
              select: {
                id: true,
                user_name: true,
                organization_id: true
              }
            },
            interactive_subjects: {
              select: {
                id: true,
                subjects: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                question_interactive_subjects: {
                  select: {
                    questions: {
                      select: {
                        id: true,
                        question: true,
                        points: true,
                        question_options: {
                          select: {
                            id: true,
                            answer: true,
                            is_correct: true,
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
      );

      const InteractiveSubjects = interactive.interactive_subjects;

      let attachments = await this.serviceFunction.getAttachments(
        interactive.id,
        "Interactives"
      );
      interactive.attachment = attachments;
      let InstructorAttachments = await this.serviceFunction.getAttachments(
        interactive.instructor_id,
        "User"
      );
      interactive.users.InstructorAttachments = InstructorAttachments.path;

      let questionIds = [];
      for (const item of InteractiveSubjects) {
        for (const newItem of item.question_interactive_subjects) {
          let QuestionId = newItem.questions.id;
          questionIds.push(QuestionId);
        }
      }

      // Sort the array in ascending order
      questionIds.sort((a, b) => a - b);

      // Create a new array to hold the distinct values
      const distinctArr = [];

      // Iterate through the sorted array and add distinct values to the new array
      for (let i = 0; i < questionIds.length; i++) {
        if (questionIds[i] !== questionIds[i - 1]) {
          distinctArr.push(questionIds[i]);
        }
      }
      let questionFinalArray = new Array();
      for (const item of distinctArr) {
        const questionsAndOptions =
          await this.prismaService.questions.findFirst({
            where: {
              id: item,
            },
            select: {
              id: true,
              question: true,
              points: true,
              instructor_id: true,
              interactive_type_id: true,
              question_options: {
                select: {
                  id: true,
                  answer: true,
                  is_correct: true,
                  question_id: true,
                },
              },
            },
          });
        if (questionsAndOptions) {
          questionFinalArray.push(questionsAndOptions);
        }
      }
      for (const item of questionFinalArray) {
        let QuestionId = item.id;
        let questionAttachment = await this.serviceFunction.getAttachments(
          QuestionId,
          "Questions"
        );
        item.attachment = questionAttachment;
        for (const newItem of item.question_options) {
          let OptionId = newItem.id;
          let optionAttachment = await this.serviceFunction.getAttachments(
            OptionId,
            "Options"
          );
          newItem.attachments = optionAttachment;
        }
      }
      let interactiveType =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: interactive.interactive_type_id,
          },
        });
      delete interactive.interactive_subjects;
      for (const item of InteractiveSubjects) {
        delete item.question_interactive_subjects;
      }
      interactive.subjects = InteractiveSubjects;
      interactive.questions = questionFinalArray;

      if (interactiveType.name === "Quest") {
        delete interactive.questions;
      }
      let session = await this.prismaService.contents.findMany({
        where: {
          content_interactive_segments: {
            some: {
              interactive_id: interactive.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
        },
      });
      interactive.sessionAttached = session;

      let duplication = await this.DuplicateInteractiveService(dto.instuctor_id, interactive, dto.interactive_name, response)

      if (response) {
        return response.status(HttpStatus.OK).json({
          data: duplication,
        });
      } else {
        return duplication;
      }
    } catch (error) {
      console.error(error);
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async InteractiveSubjects(query: interactiveSubjectQuery, response: Response) {
    try {
      let user = await this.prismaService.users.findUnique({
        where: {
          id: query.instuctor_id
        }
      })

      if (user.account_type_id == 1) {
        let totalSubjects = await this.prismaService.interactive_subjects.count({
          where: {
            interactives: {
              instructor_id: user.account_type_id == 1 ? query.instuctor_id : undefined
            },
          },
        });
        let result = [];
        let subjects = await this.prismaService.interactive_subjects.findMany({
          where: {
            interactives: {
              instructor_id: user.account_type_id == 1 ? query.instuctor_id : undefined
            },
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
        const distinctObjectsMap = new Map<string, any>();

        result.forEach(obj => {
          distinctObjectsMap.set(JSON.stringify(obj), obj);
        });

        const distinctObjects = Array.from(distinctObjectsMap.values());




        if (distinctObjects) {
          response.status(HttpStatus.OK).json({
            filters: { subjects: distinctObjects },
          });
        }
      } else {
        let result = await this.prismaService.subjects.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        if (result) {
          response.status(HttpStatus.OK).json({
            filters: { subjects: result },
          });
        }
      }


    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async findLearnerInteractives(
    dto: FindLearnerInteractive,
    response: Response
  ) {
    try {
      let InteractivesQuiz: any =
        await this.prismaService.learner_courses.findMany({
          where: {
            learner_id: dto.learner_id,
          },
          select: {
            contents: {
              select: {
                id: true,
                title: true,
                content_interactive_segments: {
                  select: {
                    start_date: true,
                    end_date: true,
                    interactives: {
                      select: {
                        id: true,
                        title: true,
                        description: true,
                        from_grade_id: true,
                        to_grade_id: true,
                        instructor_id: true,
                        interactive_type_id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      // return response.status(HttpStatus.OK).json({
      //   data: InteractivesQuiz,
      // });
      let Interactives = [];
      for (let item of InteractivesQuiz) {
        for (let value of item.contents.content_interactive_segments) {
          value.interactives.courseName = item.contents.title;
          value.interactives.startDate = value.start_date;
          value.interactives.endDate = value.end_date;
          Interactives.push(value.interactives);
          let attachments: any = await this.serviceFunction.getAttachments(
            item.contents.id,
            "CourseImage"
          );
          value.interactives.attachments = attachments;
        }
      }
      let quiz = [];
      let quest = [];
      let assingment = [];

      for (let item of Interactives) {
        if (item.interactive_type_id === 1) {
          quiz.push(item);
        }
        if (item.interactive_type_id === 2) {
          quest.push(item);
        }
        if (item.interactive_type_id === 3) {
          assingment.push(item);
        }
      }
      return response.status(HttpStatus.OK).json({
        data: { quiz, quest, assingment },
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async getByArray(dto: FindInteractiveByArray, response: Response) {
    try {
      let FinalInteractive = [];
      for (let item of dto.interactive_id_array) {
        let findInteractive = await this.prismaService.interactives.findUnique({
          where: {
            id: item,
          },
        });
        if (findInteractive) {
          const interactive: any =
            await this.prismaService.interactives.findUnique({
              where: {
                id: item,
              },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                interactive_type_id: true,
                from_grade_id: true,
                to_grade_id: true,
                interactive_subjects: {
                  select: {
                    id: true,
                    subjects: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    question_interactive_subjects: {
                      select: {
                        questions: {
                          select: {
                            id: true,
                            question: true,
                            points: true,
                            question_options: {
                              select: {
                                id: true,
                                answer: true,
                                is_correct: true,
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

          const InteractiveSubjects = interactive.interactive_subjects;

          let attachments = await this.serviceFunction.getAttachments(
            interactive.id,
            "Interactives"
          );
          interactive.attachments = attachments;

          let questionIds = [];
          for (const item of InteractiveSubjects) {
            for (const newItem of item.question_interactive_subjects) {
              let QuestionId = newItem.questions.id;
              questionIds.push(QuestionId);
            }
          }

          // Sort the array in ascending order
          questionIds.sort((a, b) => a - b);

          // Create a new array to hold the distinct values
          const distinctArr = [];

          // Iterate through the sorted array and add distinct values to the new array
          for (let i = 0; i < questionIds.length; i++) {
            if (questionIds[i] !== questionIds[i - 1]) {
              distinctArr.push(questionIds[i]);
            }
          }
          let questionFinalArray = new Array();
          for (const item of distinctArr) {
            const questionsAndOptions =
              await this.prismaService.questions.findFirst({
                where: {
                  id: item,
                },
                select: {
                  id: true,
                  question: true,
                  points: true,
                  question_options: {
                    select: {
                      id: true,
                      answer: true,
                      is_correct: true,
                    },
                  },
                },
              });
            if (questionsAndOptions) {
              questionFinalArray.push(questionsAndOptions);
            }
          }
          for (const item of questionFinalArray) {
            let QuestionId = item.id;
            let questionAttachment = await this.serviceFunction.getAttachments(
              QuestionId,
              "Questions"
            );
            item.attachment = questionAttachment;
            for (const newItem of item.question_options) {
              let OptionId = newItem.id;
              let optionAttachment = await this.serviceFunction.getAttachments(
                OptionId,
                "Options"
              );
              newItem.attachments = optionAttachment;
            }
          }
          let interactiveType =
            await this.prismaService.interactive_types.findUnique({
              where: {
                id: interactive.interactive_type_id,
              },
            });

          delete interactive.interactive_subjects;
          for (const item of InteractiveSubjects) {
            delete item.question_interactive_subjects;
          }
          interactive.subjects = InteractiveSubjects;
          interactive.questions = questionFinalArray;

          if (interactiveType.name === "Quest") {
            delete interactive.questions;
            delete interactive.interactive_type_id;
          }
          FinalInteractive.push(interactive);
        }
      }
      return response.status(HttpStatus.OK).json({
        data: FinalInteractive,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    interactiveId: number,
    files: Express.Multer.File,
    dto: UpdateInteractiveDto,
    response: Response
  ) {
    try {
      // let session = await this.prismaService.contents.findMany({
      //   where: {
      //     content_interactive_segments: {
      //       some: {
      //         interactive_id: interactiveId,
      //       },
      //     },
      //   },
      //   select: {
      //     content_sessions_content_sessions_course_idTocontents: {
      //       select: {
      //         session_id: true
      //       }
      //     }
      //   },
      // });

      // let attachedSessions = []

      // for (let content of session) {
      //   for (let content_session of content.content_sessions_content_sessions_course_idTocontents) {
      //     let find_session_Name = await this.prismaService.contents.findUnique({
      //       where: {
      //         id: content_session.session_id
      //       },
      //       select: {
      //         id: true,
      //         title: true
      //       }
      //     })
      //     attachedSessions.push(find_session_Name)
      //   }
      // }
      // if (attachedSessions.length > 0) {
      //   return response.status(HttpStatus.OK).json({
      //     message:
      //       "You can't Edit this, It's already mapped with these sessions",
      //     data: attachedSessions,
      //   });
      // }
      let isDraft: boolean;
      if (dto.isdraft === true) {
        isDraft = true;
      } else {
        isDraft = false;
      }
      let video: any = files;
      let questionArray: any;
      let subjectArray: any;
      if (dto.questions) {
        let questionString: any = dto.questions;
        questionArray = JSON.parse(questionString); // Parse the JSON and extract the inner array
      } else {
        questionArray = null;
      }
      if (dto.subjects) {
        let subjectString: any = dto.subjects;
        subjectArray = JSON.parse(subjectString); // Parse the JSON and extract the inner array
      } else {
        questionArray = null;
      }

      let findInteractive = await this.prismaService.interactives.findUnique({
        where: {
          id: interactiveId,
        },
        include: {
          interactive_subjects: {
            select: {
              id: true,
              subject_id: true,
              question_interactive_subjects: {
                select: {
                  id: true,
                  question_id: true,
                },
              },
            },
          },
        },
      });

      const updateInteractives = await this.prismaService.interactives.update({
        where: {
          id: interactiveId,
        },
        data: {
          title: dto.title ?? findInteractive.title,
          description: dto.description ?? findInteractive.description,
          from_grade_id: dto.from_grade_id ?? findInteractive.from_grade_id,
          to_grade_id: dto.to_grade_id ?? findInteractive.to_grade_id,
          duration: dto.duration ?? findInteractive.duration,
          isDraft: isDraft ?? findInteractive.isDraft,
          updated_at: new Date().toISOString(),
        },
      });
      if (dto.subjects) {
        if (findInteractive.interactive_subjects) {
          for (let item of findInteractive.interactive_subjects) {
            await this.prismaService.question_interactive_subjects.deleteMany({
              where: {
                interactive_subject_id: item.id,
              },
            });
          }
          await this.prismaService.interactive_subjects.deleteMany({
            where: {
              interactive_id: findInteractive.id,
            },
          });
        }
      }
      if (updateInteractives) {
        await this.addSubjects(subjectArray, questionArray, interactiveId);

        await this.findOne(interactiveId, response);

        let attachments: any = await this.serviceFunction.getAttachments(
          interactiveId,
          "Interactives"
        );
        let eventData = {};
        if (video.interactiveAttachment) {
          if (attachments) {
            eventData = {
              modelId: interactiveId,
              path: video.interactiveAttachment[0].path,
              fileName: video.interactiveAttachment[0].filename,
              modelName: "Interactives",
            };
            this.eventEmitter.emit("event.updateattachment", eventData);
          } else {
            eventData = {
              modelId: interactiveId,
              path: video.interactiveAttachment[0].path,
              fileName: video.interactiveAttachment[0].filename,
              modelName: "Interactives",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          }
        }
      } else {
        throw new HttpException(
          "Interactives Not Updated",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async publishInteractive(dto: PublishInteractive, response: Response) {
    try {
      let publishBranch = await this.prismaService.interactives.update({
        where: {
          id: dto.interative_id,
        },
        data: {
          isDraft: false,
        },
      });
      if (publishBranch) {
        return response.status(HttpStatus.OK).json({
          message: "Interactive has been published",
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      // let session = await this.prismaService.contents.findMany({
      //   where: {
      //     content_interactive_segments: {
      //       some: {
      //         interactive_id: id,
      //       },
      //     },
      //   },
      //   select: {
      //     id: true,
      //     title: true,
      //   },
      // });
      // if (session.length > 0) {
      //   return response.status(HttpStatus.OK).json({
      //     message:
      //       "You can't delete this, It's already mapped with these sessions",
      //     data: session,
      //   });
      // }
      let deleteInteractives = await this.prismaService.interactives.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
          deleted_at: new Date().toISOString(),
        },
      });
      if (deleteInteractives) {
        return response
          .status(HttpStatus.OK)
          .json({ message: "Interactive Deleted" });
      } else {
        throw new HttpException(
          "Interactives Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async addSubjects(subjects: [], questions: [], interactiveId: number) {
    for (let item of subjects) {
      let createInteractives =
        await this.prismaService.interactive_subjects.create({
          data: {
            subject_id: item,
            interactive_id: interactiveId,
          },
        });
      if (questions) {
        questions.map(async (element, index) => {
          await this.prismaService.question_interactive_subjects.create({
            data: {
              question_id: element,
              interactive_subject_id: createInteractives.id,
            },
          });
        });
      }
    }
  }

  async checkSubject(instructorId: number, subjects: []) {
    for (let item of subjects) {
      let findTutorSubjects =
        await this.prismaService.tutor_experiances.findFirst({
          where: {
            instructor_id: instructorId,
            subject_id: item,
          },
        });

      if (findTutorSubjects) {
        return true;
      } else {
        let findSubjectName = await this.prismaService.subjects.findUnique({
          where: {
            id: item,
          },
        });
        return `Your are not allowed to create interactives for ${findSubjectName.name}`;
      }
    }
  }
  async checkSubjectForDuplication(instructorId: number, subjects: any) {
    for (let item of subjects) {
      let findTutorSubjects =
        await this.prismaService.tutor_experiances.findFirst({
          where: {
            instructor_id: instructorId,
            subject_id: item.subject_id,
          },
        });

      if (findTutorSubjects) {
        return true;
      } else {
        let findSubjectName = await this.prismaService.subjects.findUnique({
          where: {
            id: item,
          },
        });
        return `Your are not allowed to create interactives for ${findSubjectName.name}`;
      }
    }
  }
  async addSubjectsForDuplication(instructor_id: number, subjects: any, questions: any[], interactiveId: number) {
    for (let item of subjects) {
      let createInteractives =
        await this.prismaService.interactive_subjects.create({
          data: {
            subject_id: item.subjects.id,
            interactive_id: interactiveId,
          },
        });
      if (questions?.length > 0) {
        questions.map(async (element, index) => {
          let createNewQuestion = await this.prismaService.questions.create({
            data: {
              question: element.question,
              points: element.points,
              instructor_id: instructor_id,
              interactive_type_id: element.interactive_type_id
            }
          })
          if (element.attachment) {
            await this.prismaService.attachments.create({
              data: {
                attachment_type_id: element.attachment.attachment_types.id,
                Image_key: element.attachment.Image_key,
                path: element.attachment.path,
                field_name: element.attachment.field_name,
                attachmentable_id: createNewQuestion.id,
                attachmentable_type: "Questions",
              }
            })
          }
          if (element.question_options.length > 0) {
            for (let item of element.question_options) {
              let createNewoption = await this.prismaService.question_options.create({
                data: {
                  answer: item.answer,
                  is_correct: item.is_correct,
                  question_id: createNewQuestion.id
                }
              })
              if (item.attachments) {
                await this.prismaService.attachments.create({
                  data: {
                    attachment_type_id: item.attachments.attachment_types.id,
                    Image_key: item.attachments.Image_key,
                    path: item.attachments.path,
                    field_name: item.attachments.field_name,
                    attachmentable_id: createNewoption.id,
                    attachmentable_type: "Options",
                  }
                })
              }
            }
          }
          await this.prismaService.question_interactive_subjects.create({
            data: {
              question_id: createNewQuestion.id,
              interactive_subject_id: createInteractives.id,
            },
          });
        });
      }
    }
  }

  async DuplicateInteractiveService(instructor_id: number, interactive: any, interactive_name: string, response: Response) {
    let user = await this.prismaService.users.findUnique({
      where: {
        id: instructor_id,
      },
      select: {
        account_types: {
          select: {
            name: true,
          },
        },
      },
    });
    if (user.account_types.name != "Organzation") {
      if (interactive.subjects.length > 0) {
        const checkExperinceSubjects: any = await this.checkSubjectForDuplication(
          interactive.instructor_id,
          interactive.subjects
        );
        if (checkExperinceSubjects != true) {
          return response
            .status(HttpStatus.OK)
            .json({ message: checkExperinceSubjects });
        }
      }
    }
    let userOragnization = await this.prismaService.users.findUnique({
      where: {
        id: instructor_id,
      },
      select: {
        organization_id: true,
      },
    });
    let concatinateString = interactive.title.concat(" ", "copy");
    const createDuplicateInteractives = await this.prismaService.interactives.create({
      data: {
        title: interactive_name ?? concatinateString,
        description: interactive.description,
        from_grade_id: interactive.from_grade_id,
        to_grade_id: interactive.to_grade_id,
        duration: interactive.duration,
        interactive_type_id: interactive.interactive_type_id,
        instructor_id: instructor_id,
        organization_id: userOragnization.organization_id,
        isDraft: interactive.isdraft ?? false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    });
    if (createDuplicateInteractives) {
      await this.addSubjectsForDuplication(
        instructor_id,
        interactive.subjects,
        interactive.questions,
        createDuplicateInteractives.id
      );
      console.log(interactive.attachment)
      if (interactive.attachment) {
        await this.prismaService.attachments.create({
          data: {
            attachment_type_id: interactive.attachment.attachment_types.id,
            path: interactive.attachment.path,
            field_name: 'Interactives',
            Image_key: interactive.attachment.Image_key,
            attachmentable_id: createDuplicateInteractives.id,
            attachmentable_type: 'Interactives',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }

    }
    return createDuplicateInteractives;
  }
}
