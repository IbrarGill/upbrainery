import { Module } from '@nestjs/common';
import { SmartdeskTypeService } from './smartdesk-type.service';
import { SmartdeskTypeController } from './smartdesk-type.controller';

@Module({
  controllers: [SmartdeskTypeController],
  providers: [SmartdeskTypeService]
})
export class SmartdeskTypeModule {}
