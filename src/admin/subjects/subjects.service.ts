import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class SubjectsService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createSubjectDto: CreateSubjectDto, response: Response) {
    try {
      const createSubject = await this.prismaService.subjects.create({
        data: createSubjectDto,
      });
      if (createSubject) {
        return response.status(HttpStatus.OK).json("New Subject Added");
      } else {
        throw new HttpException("Subject Not Added", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const subjects = await this.prismaService.subjects.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      if (subjects) {
        return response.status(HttpStatus.OK).json(subjects);
      } else {
        throw new HttpException("Subject Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const subject = await this.prismaService.subjects.findUnique({
        where: {
          id: id,
        },
        select: {
          id:true,
          name: true,
          subject_disciplines: {
            select: {
              id: true,
              name: true,
            },
          }
        }
      });
      if (subject) {
        return response.status(HttpStatus.OK).json(subject);
      } else {
        throw new HttpException("Subject Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
    response: Response
  ) {
    try {
      let updateSubject = await this.prismaService.subjects.update({
        where: {
          id: id,
        },
        data: updateSubjectDto,
      });
      if (updateSubject) {
        return response.status(HttpStatus.OK).json("Updated a Subject");
      } else {
        throw new HttpException("Subject Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteSubject = await this.prismaService.subjects.delete({
        where: {
          id: id,
        },
      });
      if (deleteSubject) {
        return response.status(HttpStatus.OK).json("Deleted a Subject");
      } else {
        throw new HttpException("Subject Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
