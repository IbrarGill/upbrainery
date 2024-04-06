import { forwardRef, Module } from "@nestjs/common";
import { InstructorService } from "./instructor.service";
import { InstructorController } from "./instructor.controller";
import { InteractivesModule } from "./interactives/interactives.module";
import { ContentsModule } from "./contents/contents.module";
import { CommonFunctionsService } from "src/services/commonService";
import { EventService } from "src/Events/event.service";
import { S3BucketService } from "src/services/s3_bucket_service";
import { BadgesModule } from './badges/badges.module';
import { GradebookModule } from './gradebook/gradebook.module';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService,CommonFunctionsService, EventService,S3BucketService],
  imports: [forwardRef(() => InteractivesModule), ContentsModule, BadgesModule, GradebookModule],
})
export class InstructorModule {}
