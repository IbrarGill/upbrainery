import { Module } from "@nestjs/common";
import { LearnerService } from "./learner.service";
import { LearnerController } from "./learner.controller";
import { QuizSubmissionModule } from "./quiz-submission/quiz-submission.module";
import { QuestSubmissionModule } from "./quest-submission/quest-submission.module";
import { AssignmentSubmissionModule } from "./assignment-submission/assignment-submission.module";
import { CommonFunctionsService } from "src/services/commonService";
import { EventService } from "src/Events/event.service";
import { S3BucketService } from "src/services/s3_bucket_service";
import { ClustersModule } from "./clusters/clusters.module";
import { PathwaysModule } from "./pathways/pathways.module";
import { CertificationsLevelsModule } from './certifications-levels/certifications-levels.module';
import { ActivitiesSubmissionModule } from './activities-submission/activities-submission.module';

@Module({
  controllers: [LearnerController],
  providers: [
    LearnerService,
    CommonFunctionsService,
    S3BucketService,
    EventService,
  ],
  imports: [
    QuizSubmissionModule,
    QuestSubmissionModule,
    AssignmentSubmissionModule,
    ClustersModule,
    PathwaysModule,
    CertificationsLevelsModule,
    ActivitiesSubmissionModule,
  ],
})
export class LearnerModule {}
