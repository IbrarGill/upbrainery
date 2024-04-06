import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseGuards } from '@nestjs/common';
import { PollingService } from './polling.service';
import { CreatePollingDto, PollQuery, SubmitPollDto } from './dto/create-polling.dto';
import { UpdatePollingDto } from './dto/update-polling.dto';
import { Response, response } from "express";
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/authStrategy/guard';
@Controller('')
@ApiTags('polling')
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class PollingController {
  constructor(private readonly pollingService: PollingService) {}

  @Post()
  create(@Body() createPollingDto: CreatePollingDto,@Res() response:Response) {
    return this.pollingService.createPoll(createPollingDto,response);
  }

  @Post('/submitpoll')
  submitpoll(@Body() dto: SubmitPollDto,@Res() response:Response) {
    return this.pollingService.submitpoll(dto,response);
  }

  @Get()
  findAll(@Res() response:Response,@Query() query:PollQuery) {
    return this.pollingService.findAll(query,response);
  }

  @Get(':id')
  findOne(@Param('id') id: number,@Res() response:Response) {
    return this.pollingService.findOne(id,response);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePollingDto: UpdatePollingDto,@Res() response:Response) {
    return this.pollingService.update(id, updatePollingDto,response);
  }

  @Delete(':id')
  deletePollQuestion(@Param('id') id: number, @Res()  response:Response) {
    return this.pollingService.deletePollQuestion(id,response);
  }

}
