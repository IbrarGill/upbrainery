import { Module } from "@nestjs/common";
import { OnetService } from "./onnet.service";
import { OnnetController } from "./onnet.controller";

@Module({
  controllers: [OnnetController],
  providers: [OnetService],
})
export class OnnetModule {}
