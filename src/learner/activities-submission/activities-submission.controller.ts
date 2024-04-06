import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ActivitiesSubmissionService } from './activities-submission.service';
import { CreateActivitiesSubmissionDto } from './dto/create-activities-submission.dto';
import { UpdateActivitiesSubmissionDto } from './dto/update-activities-submission.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('')
@ApiTags('activities-submission')
export class ActivitiesSubmissionController {
  constructor(private readonly activitiesSubmissionService: ActivitiesSubmissionService) { }

  @Post()
  create(@Body() createActivitiesSubmissionDto: CreateActivitiesSubmissionDto, @Res() response: Response) {
    return this.activitiesSubmissionService.create(createActivitiesSubmissionDto, response);
  }

  // @Get()
  // findAll(@Res() response: Response) {
  //   return this.activitiesSubmissionService.findAll(response);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string, @Res() response: Response) {
  //   return this.activitiesSubmissionService.findOne(+id, response);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateActivitiesSubmissionDto: UpdateActivitiesSubmissionDto, @Res() response: Response) {
  //   return this.activitiesSubmissionService.update(+id, updateActivitiesSubmissionDto, response);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string, @Res() response: Response) {
  //   return this.activitiesSubmissionService.remove(+id, response);
  // }
}
