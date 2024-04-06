import { Inject, Module } from "@nestjs/common";
import { AssignmentService } from "./assignment.service";
import { AssignmentController } from "./assignment.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService, CommonFunctionsService],
})
export class AssignmentModule {}
