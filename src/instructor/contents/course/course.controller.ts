import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Res,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { CourseService } from "./course.service";
import { CourseAssociatedSession, CreateCourseDto, DuplicationCourseDto, EnroleCourseDto, SearchContentCourse, learnerCourseQuery } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Response, Request } from "express";
import { learnerSessionQuery } from "../session/dto/create-session.dto";
import { ActivityAnd3Dmodelvalidation } from "src/AssetValidation/activity3Dmodelvalidation";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/contents/course")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post("create")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ActivityAnd3Dmodelvalidation)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: CreateCourseDto,
    @Res() response: Response
  ) {
    return this.courseService.createContentCourse(files, dto, response);
  }

  @Get("all")
  findAll(@Query() query: SearchContentCourse, @Res() response: Response) {
    return this.courseService.findAllcourses(query, response);
  }

  @Get("filters/:instuctorId")
  getCoursefilters(@Param("instuctorId") instuctorId: number, @Res() response: Response) {
    return this.courseService.getCoursefilters(instuctorId, response);
  }

  @Get("duplicate")
  duplicateCourse(@Query() query: DuplicationCourseDto, @Res() response: Response) {
    return this.courseService.duplicateCourse(query, response);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.courseService.findOneCourse(+id, response);
  }

  @Patch(":courseId")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ActivityAnd3Dmodelvalidation)
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("courseId") courseId: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Res() response: Response
  ) {
    return this.courseService.updatecourse(files, courseId, updateCourseDto, response);
  }



  @Delete(":id")
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.courseService.removeCourse(+id, response);
  }

  @Post("individual/enrole")
  individualenrolecourse(
    @Body() dto: EnroleCourseDto,
    @Res() response: Response
  ) {
    return this.courseService.enrolecoursewithindividualleaner(dto, response);
  }

  @Get("individual/courses")
  findallcourserelatedtoIndividualleaner(@Query() query: learnerCourseQuery, @Res() response: Response) {
    return this.courseService.findallcourserelatedtoIndividualleaner(query, response);
  }

  @Get("associated/session")
  associatedsession(@Query() query: CourseAssociatedSession, @Res() response: Response) {
    return this.courseService.associatedsession(query, response);
  }

}
