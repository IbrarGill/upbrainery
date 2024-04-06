import { Module } from '@nestjs/common';
import { ClassTypesService } from './class_types.service';
import { ClassTypesController } from './class_types.controller';

@Module({
  controllers: [ClassTypesController],
  providers: [ClassTypesService]
})
export class ClassTypesModule {}
