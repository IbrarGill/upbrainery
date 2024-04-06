import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateSubjectDisciplineDto } from "./dto/create-subject_discipline.dto";
import { UpdateSubjectDisciplineDto } from "./dto/update-subject_discipline.dto";
import { Response } from "express";
@Injectable()
export class SubjectDisciplinesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateSubjectDisciplineDto, response: Response) {
    try {
      let isSubjectDisplineExits =
        await this.prisma.subject_disciplines.findFirst({
          where: {
            name: dto.name,
            subject_id: dto.subjectId,
          },
        });
      if (isSubjectDisplineExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("SubjectDispline already Exist!!");
      }

      let SubjectDisplineCreated = await this.prisma.subject_disciplines.create(
        {
          data: {
            name: dto.name,
            subject_id: dto.subjectId,
            created_at:new Date().toISOString()
          },
          select: {
            id: true,
            subject_id: true,
            name: true,
          },
        }
      );
      if (SubjectDisplineCreated) {
        return response.status(HttpStatus.OK).json(SubjectDisplineCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isSubjectDisplineFound =
        await this.prisma.subject_disciplines.findMany({
          select: {
            id: true,
            subject_id: true,
            name: true,
          },
        });
      if (isSubjectDisplineFound) {
        return response.status(HttpStatus.OK).json(isSubjectDisplineFound);
      } else {
        throw new HttpException(
          "SubjectDispline Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let SubjectDisplineFound =
        await this.prisma.subject_disciplines.findUnique({
          where: {
            id: id,
          },
          select: {
            id: true,
            subject_id: true,
            name: true,
          },
        });
      if (SubjectDisplineFound) {
        return response.status(HttpStatus.OK).json(SubjectDisplineFound);
      } else {
        throw new HttpException(
          "SubjectDispline Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    dto: UpdateSubjectDisciplineDto,
    response: Response
  ) {
    try {
      let isSubjectDisplineUpdated =
        await this.prisma.subject_disciplines.update({
          where: {
            id: id,
          },
          select: {
            id: true,
            subject_id: true,
            name: true,
          },
          data: {
            name: dto.name,
            updated_at:new Date().toISOString()
          },
        });
      if (isSubjectDisplineUpdated) {
        return response.status(HttpStatus.OK).json(isSubjectDisplineUpdated);
      } else {
        throw new HttpException(
          "SubjectDispline Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSubjectDisplineFound = await this.prisma.subject_disciplines.delete(
        {
          where: {
            id: id,
          },
          select: {
            id: true,
            subject_id: true,
            name: true,
          },
        }
      );
      if (isSubjectDisplineFound) {
        return response.status(HttpStatus.OK).json(isSubjectDisplineFound);
      } else {
        throw new HttpException(
          "SubjectDispline Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
