import { Module } from "@nestjs/common";
import { PathwaysService } from "./pathways.service";
import { PathwaysController } from "./pathways.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [PathwaysController],
  providers: [PathwaysService, CommonFunctionsService],
})
export class PathwaysModule {}
