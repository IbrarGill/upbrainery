import { Controller, Post, Body, Res, Query, Get, UseGuards } from "@nestjs/common";
import { SmartdeskService } from "./smartdesk.service";
import {
  CreateSmartdeskDto,
  QuerySmartDeskDto,
  SearchSmartdeskDto,
} from "./dto/create-smartdesk.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("smartdesk")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class SmartdeskController {
  constructor(private readonly smartdeskService: SmartdeskService) {}

  @Post("save")
  create(
    @Body() createSmartdeskDto: CreateSmartdeskDto,
    @Res() response: Response
  ) {
    return this.smartdeskService.saveAttchment(createSmartdeskDto, response);
  }

  @Get("find")
  findOne(
    @Query() searchSmartdeskDto: SearchSmartdeskDto,
    @Res() response: Response
  ) {
    return this.smartdeskService.findOne(searchSmartdeskDto, response);
  }

  @Get("all-attachments")
  findAll(@Query() query: QuerySmartDeskDto, @Res() response: Response) {
    return this.smartdeskService.findAll(query, response);
  }
}
