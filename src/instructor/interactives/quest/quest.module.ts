import { Inject, Module } from "@nestjs/common";
import { QuestService } from "./quest.service";
import { QuestController } from "./quest.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [QuestController],
  providers: [QuestService, CommonFunctionsService],
})
export class QuestModule {}
