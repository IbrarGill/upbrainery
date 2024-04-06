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
} from "@nestjs/common";
import { NewQuestionsService } from "./new-question.service";
import { CreateNewQuestionDto, SearchNewQuestions } from "./dto/create-new-question.dto";
import { UpdateNewQuestionDto } from "./dto/update-new-question.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DeleteNewQuestion,
  NewQuestionEntity,
  RegistereNewQuestion,
  UpdateNewQuestion,
} from "./entities/new-question.entity";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("new-questions")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class NewQuestionsController {
  constructor(private readonly questionsService: NewQuestionsService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegistereNewQuestion,
  })

  @UsePipes(new ValidationPipe())
  create(
    @Body() createNewQuestionDto: CreateNewQuestionDto,
    @Res() response: Response
  ) {
    return this.questionsService.create(createNewQuestionDto, response);
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [NewQuestionEntity],
  })
  findAll(@Query() query: SearchNewQuestions, @Res() response: Response) {
    return this.questionsService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: NewQuestionEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.questionsService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateNewQuestion,
  })
  @UsePipes(new ValidationPipe())
  update(
    @Param("id") id: string,
    @Body() updateNewQuestionDto: UpdateNewQuestionDto,
    @Res() response: Response
  ) {
    return this.questionsService.update(
      +id,
      updateNewQuestionDto,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteNewQuestion,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.questionsService.remove(+id, response);
  }
}
