import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { CommonFunctionsService } from "src/services/commonService";
import { ActivityService } from "../activity/activity.service";
import { InteractivesService } from "src/instructor/interactives/interactives.service";

@Module({
  controllers: [CourseController],
  providers: [CourseService, CommonFunctionsService, ActivityService,InteractivesService],
})
export class CourseModule { }
