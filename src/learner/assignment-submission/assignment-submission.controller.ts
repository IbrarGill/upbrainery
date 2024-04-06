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
import { AssignmentSubmissionService } from "./assignment-submission.service";
import {
  CreateAssignmentSubmissionDto,
  SearchAssignment,
  SearchAssignmentSubmission,
} from "./dto/create-assignment-submission.dto";
import {
  MarkAssignment,
  UpdateAssignmentSubmissionDto,
} from "./dto/update-assignment-submission.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  AssignmentSubmissionEntity,
  DeleteAssignmentSubmission,
  RegisterAssignmentSubmission,
  UpdateAssignmentSubmission,
} from "./entities/assignment-submission.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("assignment-submission")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class AssignmentSubmissionController {
  constructor(
    private readonly assignmentSubmissionService: AssignmentSubmissionService
  ) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterAssignmentSubmission,
  })
  create(
    @Body() createAssignmentSubmissionDto: CreateAssignmentSubmissionDto,
    @Res() response: Response
  ) {
    return this.assignmentSubmissionService.create(
      createAssignmentSubmissionDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AssignmentSubmissionEntity],
  })
  findAll(
    @Res() response: Response,
    @Query() query: SearchAssignmentSubmission
  ) {
    return this.assignmentSubmissionService.findAll(query, response);
  }

  @Get("single/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentSubmissionEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.assignmentSubmissionService.findOne(+id, response);
  }

  @Patch("mark/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateAssignmentSubmission,
  })
  update(
    @Param("id") id: string,
    @Body() markAssignment: MarkAssignment,
    @Res() response: Response
  ) {
    return this.assignmentSubmissionService.update(
      +id,
      markAssignment,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteAssignmentSubmission,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.assignmentSubmissionService.remove(+id, response);
  }

  @Get("Assignments")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentSubmissionEntity,
  })
  findQuizes(@Query() query: SearchAssignment, @Res() response: Response) {
    return this.assignmentSubmissionService.SearchAssignment(query, response);
  }

  @Get("learner/assignments/details")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentSubmissionEntity,
  })
  learnerAssignments(@Query() query: SearchAssignment, @Res() response: Response) {
    return this.assignmentSubmissionService.learnerAssignments(query, response);
  }

  @Get("instructor-assignment")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignmentSubmissionEntity,
  })
  InstructorQuiz(@Query() query: SearchAssignment, @Res() response: Response) {
    return this.assignmentSubmissionService.InstructorAssignments(
      query,
      response
    );
  }
}
