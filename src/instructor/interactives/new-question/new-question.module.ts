import { Module } from "@nestjs/common";
import { NewQuestionsService } from "./new-question.service";
import { NewQuestionsController } from "./new-question.controller";
import { S3BucketService } from "src/services/s3_bucket_service";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [NewQuestionsController],
  providers: [NewQuestionsService, S3BucketService, CommonFunctionsService],
  imports: [],
})
export class NewQuestionModule {}
