import { Module } from "@nestjs/common";
import { ExpierenceService } from "./expierence.service";
import { ExpierenceController } from "./expierence.controller";

@Module({
  controllers: [ExpierenceController],
  providers: [ExpierenceService],
})
export class ExpierenceModule {}
