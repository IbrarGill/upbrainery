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
import { ExpertyLevelsService } from "./experty_levels.service";
import { CreateExpertyLevelDto } from "./dto/create-experty_level.dto";
import { UpdateExpertyLevelDto } from "./dto/update-experty_level.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/experty-levels")

export class ExpertyLevelsController {
  constructor(private readonly expertyLevelsService: ExpertyLevelsService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createExpertyLevelDto: CreateExpertyLevelDto,
    @Res() response: Response
  ) {
    return this.expertyLevelsService.create(createExpertyLevelDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.expertyLevelsService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.expertyLevelsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExpertyLevelDto: UpdateExpertyLevelDto,
    @Res() response: Response
  ) {
    return this.expertyLevelsService.update(
      id,
      updateExpertyLevelDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.expertyLevelsService.remove(id, response);
  }
}
