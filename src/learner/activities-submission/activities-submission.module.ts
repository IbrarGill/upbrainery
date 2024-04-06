import { Module } from '@nestjs/common';
import { ActivitiesSubmissionService } from './activities-submission.service';
import { ActivitiesSubmissionController } from './activities-submission.controller';
import { EventModule } from 'src/Events/event.module';

@Module({
  controllers: [ActivitiesSubmissionController],
  providers: [ActivitiesSubmissionService,EventModule]
})
export class ActivitiesSubmissionModule {}
