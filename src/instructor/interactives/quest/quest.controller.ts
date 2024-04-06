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
import { QuestService } from "./quest.service";
import {
  CreateQuestDto,
  DuplicateQuest,
  FindQuestByArray,
  FindLearnerQuest,
  PublishQuest,
  SearchQuest,
  VideoUploadDto,
} from "./dto/create-quest.dto";
import { UpdateQuestDto } from "./dto/update-quest.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { query, Response } from "express";
import {
  DeleteQuest,
  QuestEntity,
  RegisterQuest,
  UpdateQuest,
} from "./entities/quest.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("quest")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class QuestController {
  constructor(private readonly interactivesService: QuestService) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuest,
  })
  create(
    @Body() createQuestDto: CreateQuestDto,
    @Res() response: Response
  ) {
    return this.interactivesService.create(
      createQuestDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [QuestEntity],
  })
  findAll(@Query() query: SearchQuest, @Res() response: Response) {
    return this.interactivesService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.findOne(+id, response);
  }

  @Post("duplicate")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestEntity,
  })
  duplicate(@Body() duplicateQuest: DuplicateQuest, @Res() response: Response) {
    return this.interactivesService.duplicateQuest(duplicateQuest, response);
  }

  @Post("learner-interactives")
  @ApiResponse({
    status: HttpStatus.OK,
    type: QuestEntity,
  })
  findLearnerQuests(
    @Body() dto: FindLearnerQuest,
    @Res() response: Response
  ) {
    return this.interactivesService.findLearnerQuests(dto, response);
  }

  @Post("getbyids")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterQuest,
  })
  getByArray(
    @Body() findQuestByArray: FindQuestByArray,
    @Res() response: Response
  ) {
    return this.interactivesService.getByArray(
      findQuestByArray,
      response
    );
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuest,
  })
  update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File,
    @Body() updateQuestDto: UpdateQuestDto,
    @Res() response: Response
  ) {
    return this.interactivesService.update(
      +id,
      updateQuestDto,
      response
    );
  }

  @Patch("publish")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateQuest,
  })
  publish(
    @Body() publishQuest: PublishQuest,
    @Res() response: Response
  ) {
    return this.interactivesService.publishQuest(
      publishQuest,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteQuest,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.remove(+id, response);
  }
}
