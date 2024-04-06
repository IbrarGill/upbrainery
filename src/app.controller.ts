import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { Response } from "express";
@Controller()
@ApiTags("server")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("ping")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/logs")
  getServerLog(@Res() res: Response) {
    return this.appService.getServerLog(res);
  }
}
