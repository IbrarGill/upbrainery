import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [CommonController],
  providers: [CommonService, CommonFunctionsService],
})
export class CommonModule {}
