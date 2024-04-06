import { Module } from '@nestjs/common';
import { TeachingStylesService } from './teaching_styles.service';
import { TeachingStylesController } from './teaching_styles.controller';

@Module({
  controllers: [TeachingStylesController],
  providers: [TeachingStylesService]
})
export class TeachingStylesModule {}
