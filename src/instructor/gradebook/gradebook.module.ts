import { Module } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { GradebookController } from './gradebook.controller';
import { CommonFunctionsService } from 'src/services/commonService';

@Module({
  controllers: [GradebookController],
  providers: [GradebookService,CommonFunctionsService]
})
export class GradebookModule {}
