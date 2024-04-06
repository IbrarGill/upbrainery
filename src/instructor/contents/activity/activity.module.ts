import { Module } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { ActivityController } from "./activity.controller";
import { CommonFunctionsService } from "src/services/commonService";
import { EventListener } from "src/Events/event.Listener";
import { EventService } from "src/Events/event.service";
import { S3BucketService } from "src/services/s3_bucket_service";

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, CommonFunctionsService,S3BucketService,EventService,EventListener],
})
export class ActivityModule {}
