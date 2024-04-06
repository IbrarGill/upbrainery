import { Module } from "@nestjs/common";
import { AccountTypeService } from "./account_type.service";
import { AccountTypeController } from "./account_type.controller";

@Module({
  controllers: [AccountTypeController],
  providers: [AccountTypeService],
})
export class AccountTypeModule {}
