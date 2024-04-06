import { Module } from '@nestjs/common';
import { SubjectDisciplinesService } from './subject_disciplines.service';
import { SubjectDisciplinesController } from './subject_disciplines.controller';

@Module({
  controllers: [SubjectDisciplinesController],
  providers: [SubjectDisciplinesService]
})
export class SubjectDisciplinesModule {}
