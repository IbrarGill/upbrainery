import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateScheduleDto, SearchSchedule } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(dto: CreateScheduleDto, response: Response) {
    try {
      const createSchedule = await this.prismaService.schedules.create({
        data: {
          title: dto.title,
          description: dto.description,
          schdule_date: dto.schedue_date,
          min_duration: dto.min_duration,
          max_duration: dto.max_duration,
          on_demand: dto.on_demand,
          price: dto.price,
          start_time: dto.start_time,
          end_time: dto.end_time,
          learner_id: dto.learner_id,
          instructor_id: dto.instructor_id,
        },
      });
      if (createSchedule) {
        return response.status(HttpStatus.OK).json("New Schedule Added");
      } else {
        throw new HttpException("Schedule Not Added", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: SearchSchedule, response: Response) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      const _schdulecount = await this.prismaService.schedules.count({
        where: {
          instructor_id: query.instructor_id ?? undefined,
          learner_id: query.learner_id ?? undefined,
        }
      });

      const Schedule = await this.prismaService.schedules.findMany({
        where: {
          instructor_id: query.instructor_id ?? undefined,
          learner_id: query.learner_id ?? undefined,
        },
        skip: pageNo * limit,
        take: query?.limit,
      });
      if (Schedule) {
        return response.status(HttpStatus.OK).json({
          total: _schdulecount,
          limit: limit,
          offset: pageNo,
          data: Schedule,
        });
      } else {
        throw new HttpException("Schedule Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const Schedule = await this.prismaService.schedules.findUnique({
        where: {
          id: id,
        },
      });
      if (Schedule) {
        return response.status(HttpStatus.OK).json({
          data: Schedule,
        });
      } else {
        throw new HttpException("Schedule Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateScheduleDto, response: Response) {
    try {
      let isShedulesExit = await this.prismaService.schedules.findUnique({
        where: {
          id: id,
        },
      });

      let updateSchedule = await this.prismaService.schedules.update({
        where: {
          id: id,
        },
        data: {
          title: dto.title ?? isShedulesExit.title,
          description: dto.description ?? isShedulesExit.description,
          schdule_date: dto.schedue_date ?? isShedulesExit.schdule_date,
          min_duration: dto.min_duration ?? isShedulesExit.min_duration,
          max_duration: dto.max_duration ?? isShedulesExit.max_duration,
          on_demand: dto.on_demand ?? isShedulesExit.on_demand,
          price: dto.price ?? isShedulesExit.price,
          start_time: dto.start_time ?? isShedulesExit.start_time,
          end_time: dto.end_time ?? isShedulesExit.end_time,
          learner_id: dto.learner_id ?? isShedulesExit.learner_id,
          instructor_id: dto.instructor_id ?? isShedulesExit.instructor_id,
        },
      });
      if (updateSchedule) {
        return response.status(HttpStatus.OK).json("Updated a Schedule");
      } else {
        throw new HttpException("Schedule Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteSchedule = await this.prismaService.schedules.delete({
        where: {
          id: id,
        },
      });
      if (deleteSchedule) {
        return response.status(HttpStatus.OK).json("Deleted a Schedule");
      } else {
        throw new HttpException("Schedule Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
