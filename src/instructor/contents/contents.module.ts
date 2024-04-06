import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { ActivityModule } from './activity/activity.module';
import { CourseModule } from './course/course.module';
import { SessionModule } from './session/session.module';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService],
  imports: [ActivityModule, CourseModule, SessionModule]
})
export class ContentsModule {}
