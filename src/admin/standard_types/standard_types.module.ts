import { Module } from '@nestjs/common';
import { StandardTypesService } from './standard_types.service';
import { StandardTypesController } from './standard_types.controller';

@Module({
  controllers: [StandardTypesController],
  providers: [StandardTypesService]
})
export class StandardTypesModule {}
