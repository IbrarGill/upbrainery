import { Module } from '@nestjs/common';
import { StandardSubjectsService } from './standard_subjects.service';
import { StandardSubjectsController } from './standard_subjects.controller';

@Module({
  controllers: [StandardSubjectsController],
  providers: [StandardSubjectsService]
})
export class StandardSubjectsModule {}
