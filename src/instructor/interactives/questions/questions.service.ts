import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { CreateQuestionDto, QuestionSkills, SearchQuestions } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { Response, Request } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommonFunctionsService } from "src/services/commonService";


@Injectable()
export class QuestionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
    private serverFunctions: CommonFunctionsService
  ) { }
  async create(
    files: Express.Multer.File,
    dto: CreateQuestionDto,
    response: Response,
    request: Request
  ) {
    try {

      let images: any = files;
      let user: any = request.user;

      const inputString: any = dto.options;
      let optionArray = [];
      if (dto.options) {
        optionArray = JSON.parse(inputString); // Convert each string into an object
      }
      let userOragnization = await this.prismaService.users.findUnique({
        where: {
          id: dto.instructor_id,
        },
        select: {
          organization_id: true,
        },
      });

      const createQuestions = await this.prismaService.questions.create({
        data: {
          question: dto.question,
          points: dto.points,
          instructor_id: dto.instructor_id,
          interactive_type_id: dto.interactive_type_id,
          organization_id: userOragnization.organization_id,
          created_at: new Date().toISOString(),
        },
      });
      if (dto.questionSkill) {
        let questionSkill: QuestionSkills[] = JSON.parse(dto.questionSkill);
        await this.createQuestionSkills(createQuestions.id, questionSkill, user.organization_id)
      }

      let tempArray = [];
      if (createQuestions) {
        for (const item of optionArray) {
          let createQuestionOptions =
            await this.prismaService.question_options.create({
              data: {
                answer: item.answer,
                is_correct: item.is_correct,
                question_id: createQuestions.id,
                created_at: new Date().toISOString(),
              },
            });
          var tempObject = {
            id: createQuestionOptions.id,
            ImageName: item.image_Name,
          };
          tempArray.push(tempObject);
        }
      }
      if (createQuestions) {
        response.status(HttpStatus.OK).json({ questionId: createQuestions.id });
        let eventData = {};

        if (images.questionAttachment) {
          eventData = {
            modelId: createQuestions.id,
            path: images.questionAttachment[0].path,
            fileName: images.questionAttachment[0].filename,
            modelName: "Questions",
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }

        let optionData = {};
        if (tempArray.length > 0) {
          if (images.optionAttachment) {
            for (let index = 0; index < tempArray.length; index++) {
              if (tempArray[index].ImageName != "") {
                images.optionAttachment.forEach(
                  (element: {
                    originalname: any;
                    path: any;
                    filename: any;
                  }) => {
                    if (element.originalname === tempArray[index].ImageName) {
                      optionData = {
                        modelId: tempArray[index].id,
                        path: element.path,
                        fileName: element.filename,
                        modelName: "Options",
                      };
                      this.eventEmitter.emit("event.attachment", optionData);
                    }
                  }
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchQuestions, response: Response) {
    try {
      let user = await this.prismaService.users.findUnique({
        where: {
          id: query.instuctorId,
        },
      });

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let QuestionCount = await this.prismaService.questions.count({
        where: {
          OR: [
            {
              organization_id: user.organization_id,
              instructor_id:
                user.account_type_id === 4 ? undefined : query.instuctorId,
              interactive_type_id: query.InteractiveTypeId,
              question: {
                contains: query.searchByText ?? undefined,
              },
            },
            {
              organization_id: 6,
            }
          ]

        },
      });
      const questions: any = await this.prismaService.questions.findMany({
        where: {
          OR: [
            {
              organization_id: user.organization_id,
              instructor_id:
                user.account_type_id === 4 ? undefined : query.instuctorId,
              interactive_type_id: query.InteractiveTypeId,
              question: {
                contains: query.searchByText ?? undefined,
              },
            },
            {
              organization_id: 6,
            }
          ]
        },
        include: {
          question_options: true,
          question_skills: true
        },
        orderBy: {
          id: "desc",
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      if (questions) {
        for (let item of questions) {
          const questionAttachments = await this.serverFunctions.getAttachments(
            item.id,
            "Questions"
          );
          item.attahments = questionAttachments;
          for (const value of item.question_options) {
            const attachments = await this.serverFunctions.getAttachments(
              value.id,
              "Options"
            );
            value.attachments = attachments;
          }
        }
      }
      let InteractiveTypeId =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: query.InteractiveTypeId,
          },
        });
      if (InteractiveTypeId.name === "Assignment") {
        for (let item of questions) {
          delete item.question_options;
        }
      }

      if (questions.length > 0) {
        return response.status(HttpStatus.OK).json({
          total: QuestionCount,
          limit: limit,
          offset: pageNo,
          data: questions,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          total: QuestionCount,
          limit: limit,
          offset: pageNo,
          data: questions,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const question: any = await this.prismaService.questions.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          question: true,
          points: true,
          interactive_type_id: true,
          question_options: {
            select: {
              id: true,
              answer: true,
              is_correct: true,
            },
          },
          question_skills: {
            select: {
              id: true,
              skill_id: true,
              sub_skill_id: true,
              skill_points: true
            }
          }
        },
      });
      if (question) {
        const questionAttachments = await this.serverFunctions.getAttachments(
          question.id,
          "Questions"
        );
        question.attahments = questionAttachments;
        for (const item of question.question_options) {
          const attachments = await this.serverFunctions.getAttachments(
            item.id,
            "Options"
          );
          item.attachments = attachments;
        }
        let InteractiveTypeId =
          await this.prismaService.interactive_types.findFirst({
            where: {
              id: question.interactive_type_id,
            },
          });

        if (
          InteractiveTypeId.name === "Assignment" ||
          InteractiveTypeId.name === "Quest"
        ) {
          delete question.question_options;
        }
        return response.status(HttpStatus.OK).json({ data: question });
      } else {
        throw new HttpException("Question Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    questionId: number,
    files: Express.Multer.File,
    dto: UpdateQuestionDto,
    response: Response,
    request: Request
  ) {
    try {
      let images: any = files;
      let user: any = request.user;
      const inputString: any = dto.options;
      let optionArray = [];
      if (inputString) {
        optionArray = JSON.parse(inputString); // Convert each string into an object
      }

      let findQuestion = await this.prismaService.questions.findUnique({
        where: {
          id: questionId,
        },
        include: {
          question_options: true,
        },
      });

      const updateQuestions = await this.prismaService.questions.update({
        where: {
          id: questionId,
        },
        data: {
          question: dto.question ?? findQuestion.question,
          points: dto.points ?? findQuestion.points,
          updated_at: new Date().toISOString(),
        },
      });

      if (dto.questionSkill) {
        let questionSkill: QuestionSkills[] = JSON.parse(dto.questionSkill);
        await this.updateQuestionSkills(questionId, questionSkill, user.organization_id)
      }

      let tempArray = [];

      if (updateQuestions) {
        for (const item of optionArray) {
          if (item?.id) {
            let createQuestionOptions =
              await this.prismaService.question_options.update({
                where: {
                  id: item.id
                },
                data: {
                  answer: item.answer,
                  is_correct: item.is_correct,
                  updated_at: new Date().toISOString(),
                },
              });
            var tempObject = {
              id: createQuestionOptions.id,
              ImageName: item.image_Name,
            };
            tempArray.push(tempObject);
          } else {
            let updatedQuestionOptions =
              await this.prismaService.question_options.create({
                data: {
                  answer: item.answer,
                  question_id: questionId,
                  is_correct: item.is_correct,
                  updated_at: new Date().toISOString(),
                },
              });
            var tempObject = {
              id: updatedQuestionOptions.id,
              ImageName: item.image_Name,
            };
            tempArray.push(tempObject);
          }
        }
      }

      let updateImagesArray = []

      for (let item of tempArray) {
        if (item.ImageName != "") {
          await this.prismaService.attachments.deleteMany({
            where: {
              attachmentable_id: item.id,
              field_name: "Options",
            },
          });
          updateImagesArray.push(item)
        }
      }

      if (updateQuestions) {
        await this.findOne(questionId, response);
        let eventData = {};
        const questionAttachments = await this.serverFunctions.getAttachments(
          questionId,
          "Questions"
        );
        if (images.questionAttachment) {
          if (questionAttachments) {
            eventData = {
              modelId: questionId,
              path: images.questionAttachment[0].path,
              fileName: images.questionAttachment[0].filename,
              modelName: "Questions",
            };
            this.eventEmitter.emit("event.updateattachment", eventData);
          } else {
            eventData = {
              modelId: questionId,
              path: images.questionAttachment[0].path,
              fileName: images.questionAttachment[0].filename,
              modelName: "Questions",
            };
            this.eventEmitter.emit("event.attachment", eventData);
          }
        }

        let optionData = {};
        if (updateImagesArray.length > 0) {
          if (images.optionAttachment) {
            for (let index = 0; index < updateImagesArray.length; index++) {
              if (updateImagesArray[index].ImageName != "") {
                images.optionAttachment.forEach(
                  (element: {
                    originalname: any;
                    path: any;
                    filename: any;
                  }) => {
                    if (element.originalname === updateImagesArray[index].ImageName) {
                      optionData = {
                        modelId: updateImagesArray[index].id,
                        path: element.path,
                        fileName: element.filename,
                        modelName: "Options",
                      };
                      this.eventEmitter.emit("event.attachment", optionData);
                    }
                  }
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteQuestion = await this.prismaService.questions.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
          deleted_at: new Date().toISOString(),
        }
      });
      if (deleteQuestion) {
        return response.status(HttpStatus.OK).json("Deleted a Subject");
      } else {
        throw new HttpException("Question Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async createQuestionSkills(questionId: number, questionSkills: QuestionSkills[], organization_id: number) {
    for (const item of questionSkills) {
      await this.prismaService.question_skills.create({
        data: {
          question_id: questionId,
          skill_id: item.skillId,
          sub_skill_id: item.subskillId,
          skill_points: item.skillPoint,
          organization_id: organization_id,
        }
      })
    }
  }

  async updateQuestionSkills(questionId: number, questionSkills: QuestionSkills[], organization_id: number) {

    await this.prismaService.question_skills.deleteMany({
      where: {
        question_id: questionId
      }
    })

    for (const item of questionSkills) {
      await this.prismaService.question_skills.create({
        data: {
          question_id: questionId,
          skill_id: item.skillId,
          sub_skill_id: item.subskillId,
          skill_points: item.skillPoint,
          organization_id: organization_id,
        }
      })
    }
  }
}
