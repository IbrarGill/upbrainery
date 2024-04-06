import { Module } from '@nestjs/common';
import { StandardLevelsService } from './standard_levels.service';
import { StandardLevelsController } from './standard_levels.controller';

@Module({
  controllers: [StandardLevelsController],
  providers: [StandardLevelsService]
})
export class StandardLevelsModule {}
