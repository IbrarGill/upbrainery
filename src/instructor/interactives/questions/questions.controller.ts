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
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  UsePipes,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto, SearchQuestions } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DeleteQuestion,
  QuestionEntity,
  RegistereQuestion,
  UpdateQuestion,
} from "./entities/question.entity";
import { Response ,Request} from "express";
import { QuestionImageValidation } from "src/AssetValidation/QuestionImageValidation";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("questions")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegistereQuestion,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(QuestionImageValidation)
  @UsePipes(new ValidationPipe())
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createQuestionDto: CreateQuestionDto,
    @Res() response: Response,
    @Req() request:Request
  ) {
    return this.questionsService.create(files, createQuestionDto, response,request);
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [QuestionEntity],
  })
  findAll(@Query() query: SearchQuestions, @Res() response: Response) {
    return this.questionsService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestionEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.questionsService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuestion,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(QuestionImageValidation)
  @UsePipes(new ValidationPipe())
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("id") id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Res() response: Response,
    @Req() request:Request
  ) {
    return this.questionsService.update(
      +id,
      files,
      updateQuestionDto,
      response,
      request
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteQuestion,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.questionsService.remove(+id, response);
  }
}
