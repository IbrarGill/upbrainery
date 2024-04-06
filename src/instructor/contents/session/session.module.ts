import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SessionService } from "./session.service";
import { CourseService } from "../course/course.service";
import { SessionController } from "./session.controller";
import { ActivityService } from "../activity/activity.service";
import { CommonFunctionsService } from "src/services/commonService";
import { InteractivesService } from "src/instructor/interactives/interactives.service";

@Module({
  controllers: [SessionController],
  providers: [SessionService, CommonFunctionsService,ConfigService,CourseService,ActivityService,InteractivesService],
})
export class SessionModule {}
