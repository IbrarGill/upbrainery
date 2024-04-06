import { Controller, Get, Param, Res, Query, UseGuards } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { QueryInteractiveLearnersList, QueryLearnerQuizDetails } from './dto/create-gradebook.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from "express";
import { JwtGuard } from 'src/authStrategy/guard';
@Controller('')
@ApiTags("instructor/gradebook")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class GradebookController {
  constructor(private readonly gradebookService: GradebookService) { }


  @Get('sessiondetails/:sessionId')
  sessiondetails(@Param('sessionId') sessionId: number, @Res() response: Response) {
    return this.gradebookService.sessiondetails(sessionId, response);
  }

  @Get('interactivedetails')
  findOne(@Query() query: QueryInteractiveLearnersList, @Res() response: Response) {
    return this.gradebookService.interactiveStudentlistandmarks(query, response);
  }

  @Get('learnerquizdetails')
  learnerquizdetails(@Query() query: QueryLearnerQuizDetails, @Res() response: Response) {
    return this.gradebookService.learnerquizdetails(query, response);
  }


}
