import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { SubjectsService } from "./subjects.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DeleteSubject,
  SubjectEntity,
  UpdateSubject,
} from "./entities/subject.entity";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("/admin/subjects")

export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SubjectEntity,
  })
  @Post()
  create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Res() response: Response
  ) {
    return this.subjectsService.create(createSubjectDto, response);
  }

  @Get("/all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [SubjectEntity],
  })
  findAll(@Res() response: Response) {
    console.log("response");
    return this.subjectsService.findAll(response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: SubjectEntity,
  })
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subjectsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateSubject,
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Res() response: Response
  ) {
    return this.subjectsService.update(id, updateSubjectDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteSubject,
  })
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subjectsService.remove(id, response);
  }
}
