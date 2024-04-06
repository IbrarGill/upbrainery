import { Module } from '@nestjs/common';
import { ModuleSegmentDeliveriesService } from './module_segment_deliveries.service';
import { ModuleSegmentDeliveriesController } from './module_segment_deliveries.controller';

@Module({
  controllers: [ModuleSegmentDeliveriesController],
  providers: [ModuleSegmentDeliveriesService]
})
export class ModuleSegmentDeliveriesModule {}
