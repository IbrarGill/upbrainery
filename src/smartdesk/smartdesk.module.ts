import { Module } from "@nestjs/common";
import { SmartdeskService } from "./smartdesk.service";
import { PollingModule } from "./polling/polling.module";
import { SmartdeskController } from "./smartdesk.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [SmartdeskController],
  providers: [SmartdeskService, CommonFunctionsService],
  imports: [PollingModule],
})
export class SmartdeskModule {}
