import { Module } from '@nestjs/common';
import { ModuleSegmentTypesService } from './module_segment_types.service';
import { ModuleSegmentTypesController } from './module_segment_types.controller';

@Module({
  controllers: [ModuleSegmentTypesController],
  providers: [ModuleSegmentTypesService]
})
export class ModuleSegmentTypesModule {}
