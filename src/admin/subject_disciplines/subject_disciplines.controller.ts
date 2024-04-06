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
import { SubjectDisciplinesService } from "./subject_disciplines.service";
import { CreateSubjectDisciplineDto } from "./dto/create-subject_discipline.dto";
import { UpdateSubjectDisciplineDto } from "./dto/update-subject_discipline.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/subject-disciplines")

export class SubjectDisciplinesController {
  constructor(
    private readonly subjectDisciplinesService: SubjectDisciplinesService
  ) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createSubjectDisciplineDto: CreateSubjectDisciplineDto,
    @Res() response: Response
  ) {
    return this.subjectDisciplinesService.create(
      createSubjectDisciplineDto,
      response
    );
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.subjectDisciplinesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subjectDisciplinesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSubjectDisciplineDto: UpdateSubjectDisciplineDto,
    @Res() response: Response
  ) {
    return this.subjectDisciplinesService.update(
      id,
      updateSubjectDisciplineDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subjectDisciplinesService.remove(id, response);
  }
}
