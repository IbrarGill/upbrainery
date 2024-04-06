import { Module } from "@nestjs/common";
import { QuestSubmissionService } from "./quest-submission.service";
import { QuestSubmissionController } from "./quest-submission.controller";
import { CommonFunctionsService } from "src/services/commonService";
import { EventModule } from "src/Events/event.module";

@Module({
  controllers: [QuestSubmissionController],
  providers: [QuestSubmissionService, CommonFunctionsService, EventModule],
})
export class QuestSubmissionModule { }
