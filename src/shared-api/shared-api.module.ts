import { Module } from "@nestjs/common";
import { SharedApiService } from "./shared-api.service";
import { SharedApiController } from "./shared-api.controller";
import { S3BucketService } from "src/services/s3_bucket_service";
import { EventService } from "src/Events/event.service";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [SharedApiController],
  providers: [SharedApiService, S3BucketService, CommonFunctionsService,EventService],
})
export class SharedApiModule {}
