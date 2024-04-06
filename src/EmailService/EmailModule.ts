import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailBodyService } from "./emailBodyService";
import { SendgridService } from "./emailservice";

@Global()
@Module({
  providers: [EmailBodyService, SendgridService, ConfigService],
  exports: [EmailBodyService, SendgridService],
})
export class EmailModule {}
