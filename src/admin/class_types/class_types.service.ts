import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClassTypeDto } from './dto/create-class_type.dto';
import { UpdateClassTypeDto } from './dto/update-class_type.dto';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { PrismaService } from 'src/prisma/prisma.client';
import { Response } from "express";
@Injectable()
export class ClassTypesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(dto: CreateClassTypeDto, response: Response) {
    try {
      const isClassTypeCreated = await this.prismaService.class_types.create({
        data: {
            name:dto.classtypeName,
            created_at:new Date().toISOString()
        },
      });
      if (isClassTypeCreated) {
        return response.status(HttpStatus.OK).json("New ClassType Added");
      } else {
        throw new HttpException("Something  went wroung!!", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const class_type = await this.prismaService.class_types.findMany({});
      if (class_type) {
        return response.status(HttpStatus.OK).json(class_type);
      } else {
        throw new HttpException("classType Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const class_type = await this.prismaService.class_types.findUnique({
        where: {
          id: id,
        },
      });
      if (class_type) {
        return response.status(HttpStatus.OK).json(class_type);
      } else {
        throw new HttpException("Grade Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, updateClassTypeDto: UpdateClassTypeDto, response: Response) {
    try {
      let isClassTypeUpdated = await this.prismaService.class_types.update({
        where: {
          id: id,
        },
        data: updateClassTypeDto,
      });
      if (isClassTypeUpdated) {
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
      let deleteClassType = await this.prismaService.class_types.delete({
        where: {
          id: id,
        },
      });
      if (deleteClassType) {
        return response.status(HttpStatus.OK).json("Deleted a Grade");
      } else {
        throw new HttpException("Grade Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
