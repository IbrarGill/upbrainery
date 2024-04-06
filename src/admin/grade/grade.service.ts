import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { UpdateGradeDto } from "./dto/update-grade.dto";
import { Response, Request } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class GradeService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createGradeDto: CreateGradeDto, response: Response) {
    try {
      const createGrades = await this.prismaService.grades.create({
        data: createGradeDto,
      });
      if (createGrades) {
        return response.status(HttpStatus.OK).json("New Grade Added");
      } else {
        throw new HttpException("Grade Not Added", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const grades = await this.prismaService.grades.findMany({});
      if (grades) {
        return response.status(HttpStatus.OK).json(grades);
      } else {
        throw new HttpException("Grades Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const grade = await this.prismaService.grades.findUnique({
        where: {
          id: id,
        },
      });
      if (grade) {
        return response.status(HttpStatus.OK).json(grade);
      } else {
        throw new HttpException("Grade Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, updateGradeDto: UpdateGradeDto, response: Response) {
    try {
      let updateGrade = await this.prismaService.grades.update({
        where: {
          id: id,
        },
        data: updateGradeDto,
      });
      if (updateGrade) {
        return response.status(HttpStatus.OK).json("Updated a grade");
      } else {
        throw new HttpException("Grade Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteGrade = await this.prismaService.grades.delete({
        where: {
          id: id,
        },
      });
      if (deleteGrade) {
        return response.status(HttpStatus.OK).json("Deleted a Grade");
      } else {
        throw new HttpException("Grade Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
