import { Module } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { QuestionsController } from "./questions.controller";
import { S3BucketService } from "src/services/s3_bucket_service";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, S3BucketService, CommonFunctionsService],
  imports: [],
})
export class QuestionsModule {}
