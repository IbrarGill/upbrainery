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
import { StandardSubjectsService } from "./standard_subjects.service";
import { CreateStandardSubjectDto } from "./dto/create-standard_subject.dto";
import { UpdateStandardSubjectDto } from "./dto/update-standard_subject.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/standard-subjects")

export class StandardSubjectsController {
  constructor(
    private readonly standardSubjectsService: StandardSubjectsService
  ) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createStandardSubjectDto: CreateStandardSubjectDto,
    @Res() response: Response
  ) {
    return this.standardSubjectsService.create(
      createStandardSubjectDto,
      response
    );
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.standardSubjectsService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardSubjectsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStandardSubjectDto: UpdateStandardSubjectDto,
    @Res() response: Response
  ) {
    return this.standardSubjectsService.update(
      id,
      updateStandardSubjectDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.standardSubjectsService.remove(id, response);
  }
}
