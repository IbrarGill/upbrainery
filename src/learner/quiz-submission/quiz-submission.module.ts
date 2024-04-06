import { Module } from "@nestjs/common";
import { QuizSubmissionService } from "./quiz-submission.service";
import { QuizSubmissionController } from "./quiz-submission.controller";
import { CommonFunctionsService } from "src/services/commonService";
import { EventModule } from "src/Events/event.module";


@Module({
  controllers: [QuizSubmissionController],
  providers: [QuizSubmissionService, CommonFunctionsService,EventModule],
})
export class QuizSubmissionModule {}
