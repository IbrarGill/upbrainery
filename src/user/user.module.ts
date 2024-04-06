import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [UserController],
  providers: [UserService, CommonFunctionsService],
})
export class UserModule {}
