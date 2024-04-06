import { Module } from "@nestjs/common";
import { InteractiveTypesService } from "./interactive-types.service";
import { InteractiveTypesController } from "./interactive-types.controller";

@Module({
  controllers: [InteractiveTypesController],
  providers: [InteractiveTypesService],
})
export class InteractiveTypesModule {}
