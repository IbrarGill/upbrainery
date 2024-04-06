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
import { AssignmentService } from "./assignment.service";
import {
  CreateAssignmentDto,
  DuplicateAssignment,
  FindAssignmentByArray,
  FindLearnerAssignment,
  PublishAssignment,
  SearchAssignment,
  VideoUploadDto,
} from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";
import { ApiConsumes, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { query, Response } from "express";
import {
  DeleteAssignment,
  AssignmentEntity,
  RegisterAssignment,
  UpdateAssignment,
} from "./entities/assignment.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("assignment")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class AssignmentController {
  constructor(private readonly interactivesService: AssignmentService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterAssignment,
  })
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Res() response: Response
  ) {
    return this.interactivesService.create(
      createAssignmentDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AssignmentEntity],
  })
  findAll(@Query() query: SearchAssignment, @Res() response: Response) {
    return this.interactivesService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.findOne(+id, response);
  }

  @Post("duplicate")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentEntity,
  })
  duplicate(@Body() duplicateAssignment: DuplicateAssignment, @Res() response: Response) {
    return this.interactivesService.duplicateAssignment(duplicateAssignment, response);
  }

  @Post("learner-interactives")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentEntity,
  })
  findLearnerAssignments(
    @Body() dto: FindLearnerAssignment,
    @Res() response: Response
  ) {
    return this.interactivesService.findLearnerAssignments(dto, response);
  }

  @Post("getbyids")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterAssignment,
  })
  getByArray(
    @Body() findAssignmentByArray: FindAssignmentByArray,
    @Res() response: Response
  ) {
    return this.interactivesService.getByArray(
      findAssignmentByArray,
      response
    );
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateAssignment,
  })
  update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @Res() response: Response
  ) {
    return this.interactivesService.update(
      +id,
      updateAssignmentDto,
      response
    );
  }

  @Patch("publish")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateAssignment,
  })
  publish(
    @Body() publishAssignment: PublishAssignment,
    @Res() response: Response
  ) {
    return this.interactivesService.publishAssignment(
      publishAssignment,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteAssignment,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.interactivesService.remove(+id, response);
  }
}
