import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Res,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { QuizService } from "./quiz.service";
import {
  CreateQuizDto,
  DuplicateQuiz,
  FindQuizByArray,
  FindLearnerQuiz,
  PublishQuiz,
  SearchQuiz,
} from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { query, Response } from "express";
import {
  DeleteQuiz,
  QuizEntity,
  RegisterQuiz,
  UpdateQuiz,
} from "./entities/quiz.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("quiz")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class QuizController {
  constructor(private readonly interactivesService: QuizService) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuiz,
  })
  create(
    @Body() createQuizDto: CreateQuizDto,
    @Res() response: Response
  ) {
    return this.interactivesService.create(
      createQuizDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [QuizEntity],
  })
  findAll(@Query() query: SearchQuiz, @Res() response: Response) {
    return this.interactivesService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.findOne(+id, response);
  }

  @Post("duplicate")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizEntity,
  })
  duplicate(@Body() duplicateQuiz: DuplicateQuiz, @Res() response: Response) {
    return this.interactivesService.duplicateQuiz(duplicateQuiz, response);
  }

  @Post("learner-interactives")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizEntity,
  })
  findLearnerQuizs(
    @Body() dto: FindLearnerQuiz,
    @Res() response: Response
  ) {
    return this.interactivesService.findLearnerQuizs(dto, response);
  }

  @Post("getbyids")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuiz,
  })
  getByArray(
    @Body() findQuizByArray: FindQuizByArray,
    @Res() response: Response
  ) {
    return this.interactivesService.getByArray(
      findQuizByArray,
      response
    );
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuiz,
  })
  update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File,
    @Body() updateQuizDto: UpdateQuizDto,
    @Res() response: Response
  ) {
    return this.interactivesService.update(
      +id,
      updateQuizDto,
      response
    );
  }

  @Patch("publish")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuiz,
  })
  publish(
    @Body() publishQuiz: PublishQuiz,
    @Res() response: Response
  ) {
    return this.interactivesService.publishQuiz(
      publishQuiz,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteQuiz,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.remove(+id, response);
  }
}
