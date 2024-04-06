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
import { StandardLevelsService } from "./standard_levels.service";
import { CreateStandardLevelDto } from "./dto/create-standard_level.dto";
import { UpdateStandardLevelDto } from "./dto/update-standard_level.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/standard-levels")

export class StandardLevelsController {
  constructor(private readonly standardLevelsService: StandardLevelsService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createStandardLevelDto: CreateStandardLevelDto,
    @Res() response: Response
  ) {
    return this.standardLevelsService.create(createStandardLevelDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.standardLevelsService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardLevelsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStandardLevelDto: UpdateStandardLevelDto,
    @Res() response: Response
  ) {
    return this.standardLevelsService.update(
      id,
      updateStandardLevelDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardLevelsService.remove(id, response);
  }
}
