import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
} from "@nestjs/common";
import { LearnerService } from "./learner.service";
import { CreateLearnerDto, LearnerQuery } from "./dto/create-learner.dto";
import { UpdateLearnerDto } from "./dto/update-learner.dto";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("learner")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class LearnerController {
  constructor(private readonly learnerService: LearnerService) { }

  @Get("all")
  findAll(@Query() query: LearnerQuery, @Res() response: Response) {
    return this.learnerService.findAll(query, response);
  }

  @Get("details:id")
  findOne(@Param("id") id: number, @Res() response: Response) {
    return this.learnerService.findOne(id, response);
  }

  @Get("gethobbies")
  gethobbies(@Res() response: Response) {
    return this.learnerService.gethobbies(response);
  }

  @Get("getgoals")
  getgoals(@Res() response: Response) {
    return this.learnerService.getgoals(response);
  }

  @Get("getinterest")
  getinterest(@Res() response: Response) {
    return this.learnerService.getinterest(response);
  }

  @Get("getcareerinterest")
  getcareerinterest(@Res() response: Response) {
    return this.learnerService.getcareerinterest(response);
  }

  @Get("learnerstats/:learnerId")
  learnerstats(@Param('learnerId') learnerId: number, @Res() response: Response) {
    return this.learnerService.learnerstats(learnerId, response);
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("id") id: number,
    @Body() updateLearnerDto: UpdateLearnerDto,
    @Res() response: Response
  ) {
    return this.learnerService.update(id, files, updateLearnerDto, response);
  }

  @Delete(":id")
  remove(@Param("id") id: number, @Res() response: Response) {
    return this.learnerService.disablelearner(id, response);
  }


  @Get("badgesearned/:learnerId")
  badgesearned(@Param('learnerId') learnerId: number, @Res() response: Response) {
    return this.learnerService.badgesearned(learnerId, response);
  }

  @Get("learnerBaseSkillCourses/:learnerId")
  learnerBaseSkillCourses(@Param('learnerId') learnerId: number, @Res() response: Response, @Req() request: Request) {
    return this.learnerService.learnerBaseSkillCourses(learnerId, response, request);
  }

}
