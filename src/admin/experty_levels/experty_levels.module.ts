import { Module } from '@nestjs/common';
import { ExpertyLevelsService } from './experty_levels.service';
import { ExpertyLevelsController } from './experty_levels.controller';

@Module({
  controllers: [ExpertyLevelsController],
  providers: [ExpertyLevelsService]
})
export class ExpertyLevelsModule {}
