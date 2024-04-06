import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  CreateSmartdeskDto,
  QuerySmartDeskDto,
  SearchSmartdeskDto,
} from "./dto/create-smartdesk.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
@Injectable()
export class SmartdeskService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService
  ) {}
  async saveAttchment(dto: CreateSmartdeskDto, response: Response) {
    try {
      if (dto.id) {
        let isUpdated = await this.prisma.smartdesks.update({
          where: {
            id: dto.id,
          },
          data: {
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            smartdesk_type_id: dto.smartdesk_type_id,
            learner_id: dto.learner_id,
            editor_json: dto.editor_json,
          },
        });

        if (isUpdated) {
          response.status(HttpStatus.OK).json(isUpdated);
        }
      } else {
        let isCreated = await this.prisma.smartdesks.create({
          data: {
            course_id: dto.course_id,
            content_session_id: dto.content_session_id,
            smartdesk_type_id: dto.smartdesk_type_id,
            learner_id: dto.learner_id,
            editor_json: dto.editor_json,
          },
        });
        if (isCreated) {
          response.status(HttpStatus.OK).json(isCreated);
        }
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async findOne(query: SearchSmartdeskDto, response: Response) {
    try {
      let isFound = await this.prisma.smartdesks.findFirst({
        where: {
          course_id: query.course_id ?? undefined,
          content_session_id: query.content_session_id ?? undefined,
          smartdesk_type_id: query.smartdesk_type_id ?? undefined,
          learner_id: query.learner_id ?? undefined,
        },
      });
      if (isFound) {
        response.status(HttpStatus.OK).json(isFound.editor_json);
      } else {
        response.status(HttpStatus.OK).json({ message: "smartdesk not found" });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(query: QuerySmartDeskDto, response: Response) {
    try {
      let allSmartDesk: any = await this.prisma.smartdesks.findMany({
        where: {
          course_id: query.course_id,
          content_session_id: query.content_session_id,
          smartdesk_type_id: query.smartdesk_type_id,
          learner_id: query.learner_id,
        },
        select: {
          id: true,
        },
      });
      if (allSmartDesk) {
        for (const item of allSmartDesk) {
          const attachments = await this.serviceFunction.getAttachments(
            item.id,
            "SmartDesk"
          );
          item.attachments = attachments;
        }
        return response.status(HttpStatus.OK).json(allSmartDesk);
      } else {
        throw new HttpException("No attachments found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
