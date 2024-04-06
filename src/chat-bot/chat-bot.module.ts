import { Module } from "@nestjs/common";
import { ChatBotService } from "./chat-bot.service";
import { ChatBotController } from "./chat-bot.controller";
import { ChatGptService } from "src/services/openaiService";

@Module({
  controllers: [ChatBotController],
  providers: [ChatBotService, ChatGptService],
})
export class ChatBotModule {}
