import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ChatBotService } from "./chat-bot.service";
import { CreateChatBotDto } from "./dto/create-chat-bot.dto";
import { Response, Request } from "express";

@Controller()
@ApiTags("chatbot")
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}


  @Get("chatQuestion/:userId")
  findChatQuestions(
    @Param("userId") userId: number,
    @Res() response: Response
  ) {
    return this.chatBotService.chatQuestion(userId, response);
  }


  @Get("chatAnswer/:queryQuestion")
  findChatAnswer(
    @Param("queryQuestion") queryQuestion: string,
    @Res() response: Response
  ) {
    return this.chatBotService.chatAnswer(queryQuestion, response);
  }
}
