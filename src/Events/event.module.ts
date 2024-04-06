import { Global, Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventListener } from "./event.Listener";

@Global()
@Module({
  providers: [EventService, EventListener],
  exports: [EventService,EventListener],
})
export class EventModule {}
