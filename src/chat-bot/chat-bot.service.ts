import { HttpException, HttpStatus, Injectable, Res } from "@nestjs/common";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateChatBotDto } from "./dto/create-chat-bot.dto";
import { UpdateChatBotDto } from "./dto/update-chat-bot.dto";
import { Response, Request } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { ChatGptService } from "src/services/openaiService";

@Injectable()
export class ChatBotService {
  ChatGptService: any;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGptService: ChatGptService
  ) { }


  async chatQuestion(userId: number, @Res() response: Response) {
    try {
      const questionsArrray =
        await this.prismaService.chatbot_questions.findMany({
          select: {
            description: true,
            chatbot_question_answers: true,
          },
        });

      if (questionsArrray.length > 0) {
        return response.status(HttpStatus.OK).json(questionsArrray[0]);
      } else {
        throw new HttpException("Questions Not Exist", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async chatAnswer(queryQuestion: string, @Res() response: Response) {
    try {
 
      const answerArray =
        await this.prismaService.chatbot_question_answers.findMany({
          where: {
            chatbot_questions: {
              description: {
                contains: queryQuestion,
              },
            },
          },
        });
      const answerFromChatGpt = await this.chatGptService.getModelAnswer(
        queryQuestion
      );
      console.log(answerFromChatGpt)
      if (answerFromChatGpt) {
        let saveQuestion = await this.prismaService.chatbot_questions.create({
          data: {
            description: queryQuestion,
          },
        });
        if (saveQuestion) {
          let saveAnswer =
            await this.prismaService.chatbot_question_answers.create({
              data: {
                chatbot_question_id: saveQuestion.id,
                description: answerFromChatGpt.content,
              },
            });
          return response.status(HttpStatus.OK).json([saveAnswer]);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
