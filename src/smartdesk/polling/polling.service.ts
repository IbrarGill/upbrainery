import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  CreatePollingDto,
  PollQuery,
  SubmitPollDto,
} from "./dto/create-polling.dto";
import { UpdatePollingDto } from "./dto/update-polling.dto";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { Response } from "express";

@Injectable()
export class PollingService {
  constructor(private prisma: PrismaService) { }
  async createPoll(dto: CreatePollingDto, response: Response) {
    try {
      let isQuestionCreated = await this.prisma.poll_questions.create({
        data: {
          is_active: true,
          qustion: dto.question,
          session_id: dto.session_id,
          instructor_id: dto.instructor_id,
          no_of_students: dto.no_of_students,
        },
      });
      if (isQuestionCreated) {
        for (const item of dto.pollOptions) {
          await this.prisma.poll_question_options.create({
            data: {
              answer: item.asnwer,
              poll_question_id: isQuestionCreated.id,
            },
          });
        }
        return response.status(HttpStatus.OK).json({
          message: "Poll Created Succesfully!!",
        });
      } else {
        throw new HttpException(
          "Something went Wroung!!",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async submitpoll(dto: SubmitPollDto, response: Response) {
    try {
      let isPollSubmitBefore =
        await this.prisma.poll_question_submissions.findFirst({
          where: {
            poll_question_id: dto.poll_question_id,
            learner_id: dto.learner_id,
          },
        });

      if (isPollSubmitBefore) {
        let isPollSubmit = await this.prisma.poll_question_submissions.update({
          where: {
            id: isPollSubmitBefore.id,
          },
          data: {
            poll_question_id: dto.poll_question_id,
            poll_question_option_id: dto.poll_question_option_id,
            learner_id: dto.learner_id,
          },
        });
        if (isPollSubmit) {
          return response.status(HttpStatus.OK).json({
            message: "Poll Submitted  Succesfully!!",
          });
        } else {
          throw new HttpException(
            "Something went Wroung!!",
            HttpStatus.BAD_REQUEST
          );
        }
      } else {
        let isPollSubmit = await this.prisma.poll_question_submissions.create({
          data: {
            poll_question_id: dto.poll_question_id,
            poll_question_option_id: dto.poll_question_option_id,
            learner_id: dto.learner_id,
          },
        });
        if (isPollSubmit) {
          return response.status(HttpStatus.OK).json({
            message: "Poll Submitted  Succesfully!!",
          });
        } else {
          throw new HttpException(
            "Something went Wroung!!",
            HttpStatus.BAD_REQUEST
          );
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: PollQuery, response: Response) {
    try {


      let allPollingQuestion :any= await this.prisma.poll_questions.findFirst({
        where: {
          is_active: true,
          instructor_id: query.instuctorId ?? undefined,
          session_id: query.session_id,
        },
        orderBy: [
          {
            id: "desc",
          }
        ],
        take: 1,
        include: {
          poll_question_options: {
            include: {
              poll_question_submissions: {
                include: {
                  users: {
                    select: {
                      id: true,
                      user_name: true
                    }
                  }
                }
              },
            },
          },
        },
      });
      if (allPollingQuestion) {
        let submittedby = []
        for (const item of allPollingQuestion.poll_question_options) {
          let percenttage =
            (item.poll_question_submissions.length /
              allPollingQuestion.no_of_students) *
            100;
          item.percentage = percenttage;

          for (const learner of item.poll_question_submissions) {
            submittedby.push(learner?.users)
          }
          delete item.poll_question_submissions;

        }
        allPollingQuestion.submittedby = submittedby
        return response.status(HttpStatus.OK).json(allPollingQuestion);
      } else {
        throw new HttpException("No Poll found!!", HttpStatus.NOT_FOUND);
      }
      
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async findOne(id: number, response: Response) {
    try {
      let singlePollQuestion: any = await this.prisma.poll_questions.findUnique(
        {
          where: {
            id,
          },
          include: {
            poll_question_options: {
              include: {
                poll_question_submissions: {
                  include: {
                    users: {
                      select: {
                        id: true,
                        user_name: true
                      }
                    }
                  }
                },
              },
            },
          },
        }
      );
      if (singlePollQuestion) {
        let submittedby = []
        for (const item of singlePollQuestion.poll_question_options) {
          let percenttage =
            (item.poll_question_submissions.length /
              singlePollQuestion.no_of_students) *
            100;
          item.percentage = percenttage;

          for (const learner of item.poll_question_submissions) {
            submittedby.push(learner?.users)
          }
          delete item.poll_question_submissions;

        }
        singlePollQuestion.submittedby = submittedby
        return response.status(HttpStatus.OK).json(singlePollQuestion);
      } else {
        throw new HttpException("No Poll found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdatePollingDto, response: Response) {
    try {
      let isQuestionUpdated = await this.prisma.poll_questions.update({
        where: {
          id,
        },
        data: {
          qustion: dto.question,
          session_id: dto.session_id,
          instructor_id: dto.instructor_id,
          no_of_students: dto.no_of_students,
        },
      });
      if (isQuestionUpdated) {
        await this.prisma.poll_question_options.deleteMany({
          where: {
            poll_question_id: id,
          },
        });

        for (const item of dto.pollOptions) {
          await this.prisma.poll_question_options.create({
            data: {
              answer: item.asnwer,
              poll_question_id: isQuestionUpdated.id,
            },
          });
        }
        return response.status(HttpStatus.OK).json({
          message: "Poll Updated Succesfully!!",
        });
      } else {
        throw new HttpException(
          "Something went Wroung!!",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async deletePollQuestion(id: number, response: Response) {
    try {
      let allPollingQuestion = await this.prisma.poll_questions.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      if (allPollingQuestion) {
        return response.status(HttpStatus.OK).json(allPollingQuestion);
      } else {
        throw new HttpException("No Poll found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
