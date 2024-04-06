import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { InstructorService } from "./instructor.service";
import {
  CreateInstructorDto,
  InstructorAllLearnerQuery,
  InstructorAllSessionQuery,
  InstructorDashbaordQuery,
  SearchInstuctorQuery,
} from "./dto/create-instructor.dto";
import { UpdateInstructorDto } from "./dto/update-instructor.dto";
import { Response } from "express";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { JwtGuard } from "src/authStrategy/guard";
@ApiTags("instructor")
@Controller("")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) { }


  @Get("all")
  findAll(@Query() query: SearchInstuctorQuery, @Res() response: Response) {
    return this.instructorService.findAll(query, response);
  }

  @Get("details/:id")
  find(@Param("id") id: string, @Res() response: Response) {
    return this.instructorService.findOne(+id, response);
  }
  @Get("subjects/:instructorId")
  findInstructorSubjects(
    @Param("instructorId") instructorId: number,
    @Res() response: Response
  ) {
    return this.instructorService.findSubjects(instructorId, response);
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("id") id: number,
    @Body() updateInstructorDto: UpdateInstructorDto,
    @Res() response: Response
  ) {
    return this.instructorService.updateInstuctor(
      files,
      id,
      updateInstructorDto,
      response
    );
  }

  @Delete(":id")
  remove(@Param("id") id: number, @Res() response: Response) {
    return this.instructorService.disableTutor(id, response);
  }

  @Get("graph1/:instructorId")
  graph1(
    @Param("instructorId") instructorId: number,
    @Res() response: Response
  ) {
    return this.instructorService.graph1(instructorId, response);
  }

  @Get("dashboard")
  allinstuctorLearners(
    @Query() instructorId: InstructorDashbaordQuery,
    @Res() response: Response
  ) {
    return this.instructorService.InstructoralllearnersOnDashboard(instructorId, response);
  }

  @Get("instructorLearners")
  Instructoralllearners(
    @Query() query: InstructorAllLearnerQuery,
    @Res() response: Response
  ) {
    return this.instructorService.Instructoralllearners(query, response);
  }

  @Get("instructorsession")
  instructorsession(
    @Query() query: InstructorAllSessionQuery,
    @Res() response: Response
  ) {
    return this.instructorService.InstructorallSession(query, response);
  }


}
