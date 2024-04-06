import { Inject, Module } from "@nestjs/common";
import { QuizService } from "./quiz.service";
import { QuizController } from "./quiz.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [QuizController],
  providers: [QuizService, CommonFunctionsService],
})
export class QuizModule {}
