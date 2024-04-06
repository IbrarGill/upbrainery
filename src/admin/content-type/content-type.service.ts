import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { Response } from "express";
import { PrismaService } from 'src/prisma/prisma.client';
@Injectable()
export class ContentTypeService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(dto: CreateContentTypeDto, response: Response) {
    try {
      const isContentAdded = await this.prismaService.content_types.create({
        data: {
          title: dto.contentType,
          created_at:new Date().toISOString()
        },
      });
      if (isContentAdded) {
        return response.status(HttpStatus.OK).json("New ContentType Added");
      } else {
        throw new HttpException("Something  went wroung!!", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const content_type = await this.prismaService.content_types.findMany({});
      if (content_type) {
        return response.status(HttpStatus.OK).json(content_type);
      } else {
        throw new HttpException("content_type Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const content_type = await this.prismaService.content_types.findUnique({
        where: {
          id: id,
        },
      });
      if (content_type) {
        return response.status(HttpStatus.OK).json(content_type);
      } else {
        throw new HttpException("content_type Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, updateClassTypeDto: UpdateContentTypeDto, response: Response) {
    try {
      let isContentTypeUpdated = await this.prismaService.content_types.update({
        where: {
          id: id,
        },
        data: updateClassTypeDto,
      });
      if (isContentTypeUpdated) {
        return response.status(HttpStatus.OK).json("Updated a ContentType");
      } else {
        throw new HttpException("ContentType Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteContentType = await this.prismaService.content_types.delete({
        where: {
          id: id,
        },
      });
      if (deleteContentType) {
        return response.status(HttpStatus.OK).json("Deleted a ContentType");
      } else {
        throw new HttpException("ContentType Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
