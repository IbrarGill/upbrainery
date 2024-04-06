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
import { ScheduleService } from "./schedule.service";
import { CreateScheduleDto, SearchSchedule } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  DeleteSchedule,
  RegisterSchedule,
  ScheduleEntity,
  UpdateSchedule,
} from "./entities/schedule.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("schedule")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterSchedule,
  })
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Res() response: Response
  ) {
    return this.scheduleService.create(createScheduleDto, response);
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ScheduleEntity],
  })
  findAll(@Query() query: SearchSchedule, @Res() response: Response) {
    return this.scheduleService.findAll(query, response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: ScheduleEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.scheduleService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateSchedule,
  })
  update(
    @Param("id") id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Res() response: Response
  ) {
    return this.scheduleService.update(+id, updateScheduleDto, response);
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteSchedule,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.scheduleService.remove(+id, response);
  }
}
