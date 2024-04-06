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
import { StandardTypesService } from "./standard_types.service";
import { CreateStandardTypeDto } from "./dto/create-standard_type.dto";
import { UpdateStandardTypeDto } from "./dto/update-standard_type.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/standard-types")

export class StandardTypesController {
  constructor(private readonly standardTypesService: StandardTypesService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createStandardTypeDto: CreateStandardTypeDto,
    @Res() response: Response
  ) {
    return this.standardTypesService.create(createStandardTypeDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.standardTypesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardTypesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStandardTypeDto: UpdateStandardTypeDto,
    @Res() response: Response
  ) {
    return this.standardTypesService.update(
      id,
      updateStandardTypeDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardTypesService.remove(id, response);
  }
}
