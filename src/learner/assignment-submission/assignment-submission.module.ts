import { Module } from "@nestjs/common";
import { EventModule } from "src/Events/event.module";
import { CommonFunctionsService } from "src/services/commonService";
import { AssignmentSubmissionService } from "./assignment-submission.service";
import { AssignmentSubmissionController } from "./assignment-submission.controller";

@Module({
  controllers: [AssignmentSubmissionController],
  providers: [
    AssignmentSubmissionService,
    EventModule,
    CommonFunctionsService,
  ],
})
export class AssignmentSubmissionModule { }
