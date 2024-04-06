import { Module } from '@nestjs/common';
import { SessionTypeService } from './session_type.service';
import { SessionTypeController } from './session_type.controller';

@Module({
  controllers: [SessionTypeController],
  providers: [SessionTypeService]
})
export class SessionTypeModule {}
