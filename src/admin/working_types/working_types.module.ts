import { Module } from '@nestjs/common';
import { WorkingTypesService } from './working_types.service';
import { WorkingTypesController } from './working_types.controller';

@Module({
  controllers: [WorkingTypesController],
  providers: [WorkingTypesService]
})
export class WorkingTypesModule {}
