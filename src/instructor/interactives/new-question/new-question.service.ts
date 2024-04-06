import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { CreateNewQuestionDto, SearchNewQuestions } from "./dto/create-new-question.dto";
import { UpdateNewQuestionDto } from "./dto/update-new-question.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { S3BucketService } from "src/services/s3_bucket_service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import fs from "fs";
import { object } from "joi";
import { triggerAsyncId } from "async_hooks";
import { CommonFunctionsService } from "src/services/commonService";
import { id } from "date-fns/locale";

@Injectable()
export class NewQuestionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private bucket: S3BucketService,
    private eventEmitter: EventEmitter2,
    private serverFunctions: CommonFunctionsService
  ) { }
  async create(
    dto: CreateNewQuestionDto,
    response: Response
  ) {
    try {

      let userOragnization = await this.prismaService.users.findUnique({
        where: {
          id: dto.instructor_id,
        },
        select: {
          organization_id: true,
        },
      });

      const createNewQuestions = await this.prismaService.questions.create({
        data: {
          question: dto.question,
          points: dto.points,
          instructor_id: dto.instructor_id,
          interactive_type_id: dto.interactive_type_id,
          organization_id: userOragnization.organization_id,
          created_at: new Date().toISOString(),
        },
      });
      let tempArray = [];
      if (createNewQuestions) {
        for (const item of dto.options) {
          let createNewQuestionOptions =
            await this.prismaService.question_options.create({
              data: {
                answer: item.answer,
                is_correct: item.is_correct,
                question_id: createNewQuestions.id,
                created_at: new Date().toISOString(),
              },
            });
          await this.prismaService.attachments.create({
            data: {
              attachment_type_id: item.questionAttachment.attachment_type_id,
              Image_key: item.questionAttachment.Image_key,
              path: item.questionAttachment.path,
              field_name: item.questionAttachment.field_name,
              attachmentable_id: createNewQuestionOptions.id,
              attachmentable_type: "Options",
            }
          })
        }
      }
      if (createNewQuestions) {
        response.status(HttpStatus.OK).json({ questionId: createNewQuestions.id });
        let eventData = {};

        if (dto.questionAttachment) {
          await this.prismaService.attachments.create({
            data: {
              attachment_type_id: dto.questionAttachment.attachment_type_id,
              Image_key: dto.questionAttachment.Image_key,
              path: dto.questionAttachment.path,
              field_name: dto.questionAttachment.path,
              attachmentable_id: createNewQuestions.id,
              attachmentable_type: "NewQuestions",
            }
          })
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchNewQuestions, response: Response) {
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

      let NewQuestionCount = await this.prismaService.questions.count({
        where: {
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instuctorId,
          interactive_type_id: query.InteractiveTypeId,
          question: {
            contains: query.searchByText ?? undefined,
          },
        },
      });
      const questions: any = await this.prismaService.questions.findMany({
        where: {
          organization_id: user.organization_id,
          instructor_id:
            user.account_type_id === 4 ? undefined : query.instuctorId,
          interactive_type_id: query.InteractiveTypeId,
          question: {
            contains: query.searchByText ?? undefined,
          },
        },
        include: {
          question_options: true,
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
            "NewQuestions"
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
          total: NewQuestionCount,
          limit: limit,
          offset: pageNo,
          data: questions,
        });
      } else {
        return response.status(HttpStatus.OK).json({
          total: NewQuestionCount,
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
        },
      });
      if (question) {
        const questionAttachments = await this.serverFunctions.getAttachments(
          question.id,
          "NewQuestions"
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
        throw new HttpException("NewQuestion Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    questionId: number,
    dto: UpdateNewQuestionDto,
    response: Response
  ) {
    try {
      const inputString: any = dto.options;
      let optionArray = [];
      if (inputString) {
        optionArray = JSON.parse(inputString); // Convert each string into an object
      }

      let findNewQuestion = await this.prismaService.questions.findUnique({
        where: {
          id: questionId,
        },
        include: {
          question_options: true,
        },
      });

      const updateNewQuestions = await this.prismaService.questions.update({
        where: {
          id: questionId,
        },
        data: {
          question: dto.question ?? findNewQuestion.question,
          points: dto.points ?? findNewQuestion.points,
          updated_at: new Date().toISOString(),
        },
      });

      let tempArray = [];

      if (optionArray.length > 0) {
        let deleteOptions =
          await this.prismaService.question_options.deleteMany({
            where: {
              question_id: questionId,
            },
          });

        for (let item of findNewQuestion.question_options) {
          await this.prismaService.attachments.deleteMany({
            where: {
              attachmentable_id: item.id,
              field_name: "Options",
            },
          });
        }
      }

      if (updateNewQuestions) {
        for (const item of optionArray) {
          let createNewQuestionOptions =
            await this.prismaService.question_options.create({
              data: {
                answer: item.answer,
                is_correct: item.is_correct,
                question_id: updateNewQuestions.id,
                created_at: findNewQuestion.created_at,
                updated_at: new Date().toISOString(),
              },
            });
          var tempObject = {
            id: createNewQuestionOptions.id,
            ImageName: item.image_Name,
          };
          tempArray.push(tempObject);
        }
      }
      if (updateNewQuestions) {
        await this.findOne(questionId, response);
        let eventData = {};
        const questionAttachments = await this.serverFunctions.getAttachments(
          questionId,
          "NewQuestions"
        );
        // if (images.questionAttachment) {
        //   if (questionAttachments) {
        //     eventData = {
        //       modelId: questionId,
        //       path: images.questionAttachment[0].path,
        //       fileName: images.questionAttachment[0].filename,
        //       modelName: "NewQuestions",
        //     };
        //     this.eventEmitter.emit("event.updateattachment", eventData);
        //   } else {
        //     eventData = {
        //       modelId: questionId,
        //       path: images.questionAttachment[0].path,
        //       fileName: images.questionAttachment[0].filename,
        //       modelName: "NewQuestions",
        //     };
        //     this.eventEmitter.emit("event.attachment", eventData);
        //   }
        // }

        let optionData = {};
        // if (tempArray.length > 0) {
        //   if (images.optionAttachment) {
        //     for (let index = 0; index < tempArray.length; index++) {
        //       if (tempArray[index].ImageName != "") {
        //         images.optionAttachment.forEach(
        //           (element: {
        //             originalname: any;
        //             path: any;
        //             filename: any;
        //           }) => {
        //             if (element.originalname === tempArray[index].ImageName) {
        //               optionData = {
        //                 modelId: tempArray[index].id,
        //                 path: element.path,
        //                 fileName: element.filename,
        //                 modelName: "Options",
        //               };
        //               this.eventEmitter.emit("event.attachment", optionData);
        //             }
        //           }
        //         );
        //       }
        //     }
        //   }
        // }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteNewQuestion = await this.prismaService.questions.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
          deleted_at: new Date().toISOString(),
        }
      });
      if (deleteNewQuestion) {
        return response.status(HttpStatus.OK).json("Deleted a Subject");
      } else {
        throw new HttpException("NewQuestion Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
