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
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuestSubmissionService } from "./quest-submission.service";
import {
  CreateNewQuestSubmissionDto,
  CreateQuestSubmissionDto,
  MarkQuest,
  SearchQuest,
  SearchQuestSubmission,
} from "./dto/create-quest-submission.dto";
import { UpdateQuestSubmissionDto } from "./dto/update-quest-submission.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  DeleteQuestSubmission,
  QuestSubmissionEntity,
  RegisterQuestSubmission,
  UpdateQuestSubmission,
} from "./entities/quest-submission.entity";
import { InteractivesQuestValidation } from "src/AssetValidation/InteractivesImageValidation";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("quest-submission")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class QuestSubmissionController {
  constructor(
    private readonly questSubmissionService: QuestSubmissionService
  ) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuestSubmission,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InteractivesQuestValidation)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createQuestSubmissionDto: CreateQuestSubmissionDto,
    @Res() response: Response
  ) {
    return this.questSubmissionService.create(
      files,
      createQuestSubmissionDto,
      response
    );
  }

  @Post("create/new")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuestSubmission,
  })
  newCreate(
    @Body() createNewQuestSubmissionDto: CreateNewQuestSubmissionDto,
    @Res() response: Response
  ) {
    return this.questSubmissionService.newCreate(
      createNewQuestSubmissionDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [QuestSubmissionEntity],
  })
  findAll(@Res() response: Response, @Query() query: SearchQuestSubmission) {
    return this.questSubmissionService.findAll(query, response);
  }

  @Get("single/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestSubmissionEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.questSubmissionService.findOne(+id, response);
  }

  @Patch("mark/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuestSubmission,
  })
  update(
    @Param("id") id: string,
    @Body() markQuest: MarkQuest,
    @Res() response: Response
  ) {
    return this.questSubmissionService.update(+id, markQuest, response);
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteQuestSubmission,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.questSubmissionService.remove(+id, response);
  }

  @Get("quests")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestSubmissionEntity,
  })
  findQuizes(@Query() query: SearchQuest, @Res() response: Response) {
    return this.questSubmissionService.SearchQuest(query, response);
  }

  @Get("learner/quest/details")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestSubmissionEntity,
  })
  learnerQuests(@Query() query: SearchQuest, @Res() response: Response) {
    return this.questSubmissionService.learnerQuests(query, response);
  }

  @Get("instructor-quest")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestSubmissionEntity,
  })
  InstructorQuiz(@Query() query: SearchQuest, @Res() response: Response) {
    return this.questSubmissionService.InstructorQuests(query, response);
  }
}
