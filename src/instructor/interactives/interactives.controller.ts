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
import { InteractivesService } from "./interactives.service";
import {
  CreateInteractiveDto,
  DuplicateInteractive,
  FindInteractiveByArray,
  FindLearnerInteractive,
  PublishInteractive,
  SearchInteractive,
  VideoUploadDto,
  interactiveSubjectQuery,
} from "./dto/create-interactive.dto";
import { UpdateInteractiveDto } from "./dto/update-interactive.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { query, Response } from "express";
import {
  DeleteInteractive,
  InteractiveEntity,
  RegisterInteractive,
  UpdateInteractive,
} from "./entities/interactive.entity";
import { InteractivesImageValidation } from "src/AssetValidation/InteractivesImageValidation";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("interactives")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class InteractivesController {
  constructor(private readonly interactivesService: InteractivesService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterInteractive,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InteractivesImageValidation)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createInteractiveDto: CreateInteractiveDto,
    @Res() response: Response
  ) {
    return this.interactivesService.create(
      files,
      createInteractiveDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [InteractiveEntity],
  })
  findAll(@Query() query: SearchInteractive, @Res() response: Response) {
    return this.interactivesService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: InteractiveEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.findOne(+id, response);
  }

  @Get("interactive/subjects")
  @ApiResponse({
    status: HttpStatus.OK,
    type: InteractiveEntity,
  })
  interactiveSubjects(@Query() query: interactiveSubjectQuery, @Res() response: Response) {
    return this.interactivesService.InteractiveSubjects(query, response);
  }

  @Post("duplicate")
  @ApiResponse({
    status: HttpStatus.OK,
    type: InteractiveEntity,
  })
  duplicate(@Body() duplicateInteractive: DuplicateInteractive, @Res() response: Response) {
    return this.interactivesService.duplicateInteractive(duplicateInteractive, response);
  }

  @Post("learner-interactives")
  @ApiResponse({
    status: HttpStatus.OK,
    type: InteractiveEntity,
  })
  findLearnerInteractives(
    @Body() dto: FindLearnerInteractive,
    @Res() response: Response
  ) {
    return this.interactivesService.findLearnerInteractives(dto, response);
  }

  @Post("getbyids")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterInteractive,
  })
  getByArray(
    @Body() findInteractiveByArray: FindInteractiveByArray,
    @Res() response: Response
  ) {
    return this.interactivesService.getByArray(
      findInteractiveByArray,
      response
    );
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InteractivesImageValidation)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateInteractive,
  })
  update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File,
    @Body() updateInteractiveDto: UpdateInteractiveDto,
    @Res() response: Response
  ) {
    return this.interactivesService.update(
      +id,
      files,
      updateInteractiveDto,
      response
    );
  }

  @Patch("publish")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateInteractive,
  })
  publish(
    @Body() publishInteractive: PublishInteractive,
    @Res() response: Response
  ) {
    return this.interactivesService.publishInteractive(
      publishInteractive,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteInteractive,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.remove(+id, response);
  }
}
