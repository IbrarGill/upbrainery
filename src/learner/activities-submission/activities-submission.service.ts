import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateActivitiesSubmissionDto } from './dto/create-activities-submission.dto';
import { UpdateActivitiesSubmissionDto } from './dto/update-activities-submission.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.client';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class ActivitiesSubmissionService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2
  ) { }
  async create(dto: CreateActivitiesSubmissionDto, response: Response) {
    try {
      let learner_course_found = await this.prismaService.learner_courses.findFirst({
        where: {
          course_id: dto.course_id,
          learner_id: dto.learner_id,
          content_session_id: dto.content_session_id
        }
      })

      if (learner_course_found) {
        let time = learner_course_found?.spend_time ?? 0;
        await this.prismaService.learner_courses.update({
          where: {
            id: learner_course_found.id
          },
          data: {
            spend_time: time + dto.time_spent
          }
        })

        response.status(HttpStatus.OK).json({
          message: 'Session Time Recorded Succesfully!!'
        })
        this.eventEmitter.emit("event.updatelearnerprogress", dto.course_id, dto.learner_id, dto.content_session_id);
      } else {
        throw new HttpException('Session Not Found!!', HttpStatus.NOT_FOUND)
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  // async findAll(response: Response) {
  //   try {
  //     const ActivityRecords = await this.prismaService.content_module_segment_time_record.findMany({});
  //     if (ActivityRecords) {
  //       return response.status(HttpStatus.OK).json(ActivityRecords);
  //     } else {
  //       throw new HttpException(
  //         "Activity Record Does't Exists",
  //         HttpStatus.NOT_FOUND
  //       );
  //     }
  //   } catch (error) {
  //     PrismaException.prototype.findprismaexception(error, response);
  //   }
  // }

  // async findOne(id: number, response: Response) {
  //   try {
  //     const ActivityRecord = await this.prismaService.content_module_segment_time_record.findUnique({
  //       where: {
  //         id: id,
  //       },
  //     });
  //     if (ActivityRecord) {
  //       return response.status(HttpStatus.OK).json(ActivityRecord);
  //     } else {
  //       throw new HttpException("Activity Record Not Found", HttpStatus.NOT_FOUND);
  //     }
  //   } catch (error) {
  //     PrismaException.prototype.findprismaexception(error, response);
  //   }
  // }

  // async update(
  //   id: number,
  //   dto: UpdateActivitiesSubmissionDto,
  //   response: Response
  // ) {
  //   try {
  //     let updateActivityRecord = await this.prismaService.content_module_segment_time_record.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         learner_id: dto.learner_id,
  //         session_id: dto.session_id,
  //         activity_id: dto.activity_id,
  //         time_spent: dto.time_spent
  //       },
  //     });
  //     if (updateActivityRecord) {
  //       return response.status(HttpStatus.OK).json("Updated an Activity Record");
  //     } else {
  //       throw new HttpException(
  //         "Activity Record Does't Exists",
  //         HttpStatus.NOT_FOUND
  //       );
  //     }
  //   } catch (error) {
  //     PrismaException.prototype.findprismaexception(error, response);
  //   }
  // }

  // async remove(id: number, response: Response) {
  //   try {
  //     let deleteActivityRecord = await this.prismaService.content_module_segment_time_record.delete({
  //       where: {
  //         id: id,
  //       },
  //     });
  //     if (deleteActivityRecord) {
  //       return response.status(HttpStatus.OK).json("Deleted an Activity Record");
  //     } else {
  //       throw new HttpException(
  //         "Activity Record Does't Exists",
  //         HttpStatus.NOT_FOUND
  //       );
  //     }
  //   } catch (error) {
  //     PrismaException.prototype.findprismaexception(error, response);
  //   }
  // }
}
