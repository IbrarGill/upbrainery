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
import { GradeService } from "./grade.service";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { UpdateGradeDto } from "./dto/update-grade.dto";
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import {
  DeleteGrade,
  GradeEntity,
  RegisteredGrade,
  UpdateGrade,
} from "./entities/grade.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("/admin/grade")

export class GradeController {
  constructor(private readonly gradeService: GradeService) { }
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredGrade,
  })
  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(@Body() createGradeDto: CreateGradeDto, @Res() response: Response) {
    return this.gradeService.create(createGradeDto, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: [GradeEntity],
  })
  @Get("all")
  findAll(@Res() response: Response) {
    return this.gradeService.findAll(response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: GradeEntity,
  })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.gradeService.findOne(id, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateGrade,
  })
  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto,
    @Res() response: Response
  ) {
    return this.gradeService.update(id, updateGradeDto, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteGrade,
  })
  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.gradeService.remove(id, response);
  }
}
