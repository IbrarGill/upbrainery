import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuizSubmissionService } from "./quiz-submission.service";
import {
  CreateQuizSubmissionDto,
  SearchQuizes,
  SearchQuizesAnswers,
  SearchQuizResult,
  SearchQuizSubmission,
} from "./dto/create-quiz-submission.dto";
import { UpdateQuizSubmissionDto } from "./dto/update-quiz-submission.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DeleteQuizSubmission,
  QuizSubmissionEntity,
  QuizSubmissionStats,
  RegisterQuizSubmission,
  UpdateQuizSubmission,
} from "./entities/quiz-submission.entity";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("quiz-submission")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class QuizSubmissionController {
  constructor(private readonly quizSubmissionService: QuizSubmissionService) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuizSubmission,
  })
  create(
    @Body() createQuizSubmissionDto: CreateQuizSubmissionDto,
    @Res() response: Response
  ) {
    return this.quizSubmissionService.create(createQuizSubmissionDto, response);
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [QuizSubmissionEntity],
  })
  findAll(@Res() response: Response, @Query() query: SearchQuizSubmission) {
    return this.quizSubmissionService.findAll(query, response);
  }

  @Get("single/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizSubmissionEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.quizSubmissionService.findOne(+id, response);
  }


  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteQuizSubmission,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.quizSubmissionService.remove(+id, response);
  }

  @Get("stats")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizSubmissionStats,
  })
  findQuizStats(@Query() query: SearchQuizResult, @Res() response: Response) {
    return this.quizSubmissionService.QuizStats(query, response);
  }

  @Get("quizes")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizSubmissionStats,
  })
  findQuizes(@Query() query: SearchQuizes, @Res() response: Response) {
    return this.quizSubmissionService.SearchQuiz(query, response);
  }

  @Patch("retake/quiz")
  update(
    @Body() updateQuizSubmissionDto: UpdateQuizSubmissionDto,
    @Res() response: Response
  ) {
    return this.quizSubmissionService.ReTakeQuiz(
      updateQuizSubmissionDto,
      response
    );
  }

  @Get("answers")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizSubmissionStats,
  })
  findAnswers(@Query() query: SearchQuizesAnswers, @Res() response: Response) {
    return this.quizSubmissionService.SearchAnswers(query, response);
  }

  @Get("instructor-quizes")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuizSubmissionStats,
  })
  InstructorQuiz(@Query() query: SearchQuizes, @Res() response: Response) {
    return this.quizSubmissionService.InstructorQuizes(query, response);
  }
}
