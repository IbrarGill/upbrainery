import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { SessionTypeService } from "./session_type.service";
import { CreateSessionTypeDto } from "./dto/create-session_type.dto";
import { UpdateSessionTypeDto } from "./dto/update-session_type.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/session-type")

export class SessionTypeController {
  constructor(private readonly sessionTypeService: SessionTypeService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createSessionTypeDto: CreateSessionTypeDto,
    @Res() response: Response
  ) {
    return this.sessionTypeService.create(createSessionTypeDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.sessionTypeService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.sessionTypeService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSessionTypeDto: UpdateSessionTypeDto,
    @Res() response: Response
  ) {
    return this.sessionTypeService.update(id, updateSessionTypeDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.sessionTypeService.remove(id, response);
  }
}
