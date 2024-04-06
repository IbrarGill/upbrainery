import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import {
  CreateAssignmentDto,
  PublishAssignment,
  SearchAssignment,
  FindAssignmentByArray,
  FindLearnerAssignment,
  DuplicateAssignment,
} from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { CommonFunctionsService } from "src/services/commonService";
import { id } from "date-fns/locale";
import { InteractiveType } from "src/admin/interactive-types/entities/interactive-type.entity";
import { concat } from "rxjs/operators";

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prismaService: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(
    dto: CreateAssignmentDto,
    response: Response
  ) {
    try {
      let questionArray: any;
      let subjectArray: any;

      let interactiveType = await this.prismaService.interactive_types.findFirst({
        where: {
          name: "Assignment"
        }
      })
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
      const createAssignments = await this.prismaService.interactives.create({
        data: {
          title: dto.title,
          description: dto.description,
          from_grade_id: dto.from_grade_id,
          to_grade_id: dto.to_grade_id,
          duration: dto.duration,
          interactive_type_id: interactiveType.id,
          instructor_id: dto.instructor_id,
          organization_id: userOragnization.organization_id,
          isDraft: dto.isdraft ?? false,
          is_active: true,
          created_at:new Date().toISOString(),
        },
      });
      if (createAssignments) {
        await this.addSubjects(
          subjectArray,
          questionArray,
          createAssignments.id
        );

        response.status(HttpStatus.OK).json("New Assignments Added");
      } else {
        throw new HttpException(
          "Assignments Not Added",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {

      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchAssignment, response: Response) {
    try {
      let interactiveType = await this.prismaService.interactive_types.findFirst({
        where: {
          name: "Assignment"
        }
      })

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;
      let user = await this.prismaService.users.findUnique({
        where: {
          id: query.instuctorId,
        },
      });

      let AssignmentType =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: interactiveType.id,
          },
        });
      let AssignmentCount = await this.prismaService.interactives.count({
        where: {
          OR: [
            {
              title: {
                contains: query.searchByText ?? undefined,
              },
            },
            {
              interactive_subjects: {
                some: {
                  subjects: {
                    name: {
                      contains: query.searchByText ?? undefined,
                    },
                  },
                },
              },
            },
          ],

          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instuctorId,
          interactive_type_id: AssignmentType.id,
          interactive_subjects: {
            some: {
              subject_id: query.subjectsId ?? undefined,
            },
          },
          from_grade_id: {
            lte: query.endGrade ?? undefined,
          },
          to_grade_id: {
            gte: query.startGrade ?? undefined,
          },
        },
      });

      const interactives: any = await this.prismaService.interactives.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query.searchByText ?? undefined,
              },
            },
            {
              interactive_subjects: {
                some: {
                  subjects: {
                    name: {
                      contains: query.searchByText ?? undefined,
                    },
                  },
                },
              },
            },
          ],
          is_active: true,
          interactive_type_id: AssignmentType.id ?? undefined,
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instuctorId,
          interactive_subjects: {
            some: {
              subject_id: query.subjectsId ?? undefined,
            },
          },
          from_grade_id: {
            lte: query.endGrade ?? undefined,
          },
          to_grade_id: {
            gte: query.startGrade ?? undefined,
          },
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
      for (let item of interactives) {
        let InstructorAttachments: any = await this.serviceFunction.getAttachments(
          item.instructor_id,
          "User"
        );
        item.users.InstructorAttachments = InstructorAttachments.path;
      }
      if (interactives.length > 0) {
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

      if (interactives.length > 0) {
        return response.status(HttpStatus.OK).json({
          total: AssignmentCount,
          limit: limit,
          offset: pageNo,
          data: interactives,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          total: AssignmentCount,
          limit: limit,
          offset: pageNo,
          data: interactives,
        });
      }
    } catch (error) {
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

      const AssignmentSubjects = interactive.interactive_subjects;

      let attachments = await this.serviceFunction.getAttachments(
        interactive.id,
        "Assignments"
      );
      let InstructorAttachments = await this.serviceFunction.getAttachments(
        interactive.instructor_id,
        "User"
      );
      interactive.users.InstructorAttachments = InstructorAttachments.path;

      let questionIds = [];
      for (const item of AssignmentSubjects) {
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
      for (const item of AssignmentSubjects) {
        delete item.question_interactive_subjects;
      }
      interactive.subjects = AssignmentSubjects;
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


  async duplicateAssignment(dto: DuplicateAssignment, response: Response) {
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

      const AssignmentSubjects = interactive.interactive_subjects;

      let attachments = await this.serviceFunction.getAttachments(
        interactive.id,
        "Assignments"
      );
      let InstructorAttachments = await this.serviceFunction.getAttachments(
        interactive.instructor_id,
        "User"
      );
      interactive.users.InstructorAttachments = InstructorAttachments.path;

      let questionIds = [];
      for (const item of AssignmentSubjects) {
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
      for (const item of AssignmentSubjects) {
        delete item.question_interactive_subjects;
      }
      interactive.subjects = AssignmentSubjects;
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

      let duplication = await this.DuplicateAssignmentService(dto.instuctor_id, interactive, response)

      if (interactive) {
        return response.status(HttpStatus.OK).json({
          data: duplication,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          data: duplication,
        });
      }
    } catch (error) {
      console.error(error);
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async findLearnerAssignments(
    dto: FindLearnerAssignment,
    response: Response
  ) {
    try {
      let AssignmentsQuiz: any =
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
      //   data: AssignmentsQuiz,
      // });
      let Assignments = [];
      for (let item of AssignmentsQuiz) {
        for (let value of item.contents.content_interactive_segments) {
          value.interactives.courseName = item.contents.title;
          value.interactives.startDate = value.start_date;
          value.interactives.endDate = value.end_date;
          Assignments.push(value.interactives);
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

      for (let item of Assignments) {
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
  async getByArray(dto: FindAssignmentByArray, response: Response) {
    try {
      let FinalAssignment = [];
      for (let item of dto.interactive_id_array) {
        let findAssignment = await this.prismaService.interactives.findUnique({
          where: {
            id: item,
          },
        });
        if (findAssignment) {
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

          const AssignmentSubjects = interactive.interactive_subjects;

          let attachments = await this.serviceFunction.getAttachments(
            interactive.id,
            "Interactives"
          );
          interactive.attachments = attachments;

          let questionIds = [];
          for (const item of AssignmentSubjects) {
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
          for (const item of AssignmentSubjects) {
            delete item.question_interactive_subjects;
          }
          interactive.subjects = AssignmentSubjects;
          interactive.questions = questionFinalArray;

          if (interactiveType.name === "Quest") {
            delete interactive.questions;
            delete interactive.interactive_type_id;
          }
          FinalAssignment.push(interactive);
        }
      }
      return response.status(HttpStatus.OK).json({
        data: FinalAssignment,
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    interactiveId: number,
    dto: UpdateAssignmentDto,
    response: Response
  ) {
    try {
      let isDraft: boolean;
      if (dto.isdraft === true) {
        isDraft = true;
      } else {
        isDraft = false;
      }
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

      let findAssignment = await this.prismaService.interactives.findUnique({
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

      const updateAssignments = await this.prismaService.interactives.update({
        where: {
          id: interactiveId,
        },
        data: {
          title: dto.title ?? findAssignment.title,
          description: dto.description ?? findAssignment.description,
          from_grade_id: dto.from_grade_id ?? findAssignment.from_grade_id,
          to_grade_id: dto.to_grade_id ?? findAssignment.to_grade_id,
          duration: dto.duration ?? findAssignment.duration,
          isDraft: isDraft ?? findAssignment.isDraft,
          updated_at:new Date().toISOString(),
        },
      });
      if (dto.subjects) {
        if (findAssignment.interactive_subjects) {
          for (let item of findAssignment.interactive_subjects) {
            await this.prismaService.question_interactive_subjects.deleteMany({
              where: {
                interactive_subject_id: item.id,
              },
            });
          }
          await this.prismaService.interactive_subjects.deleteMany({
            where: {
              interactive_id: findAssignment.id,
            },
          });
        }
      }
      if (updateAssignments) {
        await this.addSubjects(subjectArray, questionArray, interactiveId);

        await this.findOne(interactiveId, response);

        let attachments: any = await this.serviceFunction.getAttachments(
          interactiveId,
          "Assignments"
        );
      } else {
        throw new HttpException(
          "Assignments Not Updated",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async publishAssignment(dto: PublishAssignment, response: Response) {
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
          message: "Assignment has been published",
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let session = await this.prismaService.contents.findMany({
        where: {
          content_interactive_segments: {
            some: {
              interactive_id: id,
            },
          },
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (session.length > 0) {
        return response.status(HttpStatus.OK).json({
          message:
            "You can't delete this, It's already mapped with these sessions",
          data: session,
        });
      }
      let deleteAssignments = await this.prismaService.interactives.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
          deleted_at:new Date().toISOString(),
        },
      });
      if (deleteAssignments) {
        return response
          .status(HttpStatus.OK)
          .json({ message: "Assignment Deleted" });
      } else {
        throw new HttpException(
          "Assignments Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async addSubjects(subjects: [], questions: [], interactiveId: number) {
    for (let item of subjects) {
      let createAssignments =
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
              interactive_subject_id: createAssignments.id,
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
  async addSubjectsForDuplication(subjects: any, questions: any[], interactiveId: number) {
    for (let item of subjects) {
      let createAssignments =
        await this.prismaService.interactive_subjects.create({
          data: {
            subject_id: item.subjects.id,
            interactive_id: interactiveId,
          },
        });
      if (questions.length > 0) {
        questions.map(async (element, index) => {
          await this.prismaService.question_interactive_subjects.create({
            data: {
              question_id: element.id,
              interactive_subject_id: createAssignments.id,
            },
          });
        });
      }
    }
  }

  async DuplicateAssignmentService(instructor_id: number, interactive: any, response: Response) {
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
    const createDuplicateAssignments = await this.prismaService.interactives.create({
      data: {
        title: concatinateString,
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
    if (createDuplicateAssignments) {
      await this.addSubjectsForDuplication(
        interactive.subjects,
        interactive.questions,
        createDuplicateAssignments.id
      );
      let eventData = {};
      if (interactive.attachments) {
        await this.prismaService.attachments.create({
          data: {
            attachment_type_id: interactive.attachment_type.id,
            path: interactive.attachments.path,
            field_name: 'Assignments',
            attachmentable_id: createDuplicateAssignments.id,
            attachmentable_type: 'Assignments',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }

    }
    return createDuplicateAssignments;
  }
}
