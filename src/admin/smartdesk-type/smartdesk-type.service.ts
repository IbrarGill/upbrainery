import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSmartdeskTypeDto } from './dto/create-smartdesk-type.dto';
import { UpdateSmartdeskTypeDto } from './dto/update-smartdesk-type.dto';
import { PrismaService } from 'src/prisma/prisma.client';
import { PrismaException } from 'src/prisma/prismaException/prismaException';
import { Response } from "express";

@Injectable()
export class SmartdeskTypeService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(dto: CreateSmartdeskTypeDto, response: Response) {
    try {
      const isSmartDeskTypeCreated = await this.prismaService.smartdesk_types.create({
        data: dto,
      });
      if (isSmartDeskTypeCreated) {
        return response.status(HttpStatus.OK).json("New Smart Desk Type Added");
      } else {
        throw new HttpException("Smart Desk Type Not Added", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const smartdeskFound = await this.prismaService.smartdesk_types.findMany({
        select: {
          id: true,
          title: true,
        },
      });
      if (smartdeskFound) {
        return response.status(HttpStatus.OK).json(smartdeskFound);
      } else {
        throw new HttpException("SmartDeskType Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const isSmartDeskTypeExist = await this.prismaService.smartdesk_types.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true
        }
      });
      if (isSmartDeskTypeExist) {
        return response.status(HttpStatus.OK).json(isSmartDeskTypeExist);
      } else {
        throw new HttpException("Subject Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    dto: UpdateSmartdeskTypeDto,
    response: Response
  ) {
    try {
      let isSmartDeskTypeUpdated = await this.prismaService.smartdesk_types.update({
        where: {
          id: id,
        },
        data: dto,
      });
      if (isSmartDeskTypeUpdated) {
        return response.status(HttpStatus.OK).json("Updated a SmartDesk");
      } else {
        throw new HttpException("SmartDesk Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSmartDeskTypeDeleted = await this.prismaService.smartdesk_types.delete({
        where: {
          id: id,
        },
      });
      if (isSmartDeskTypeDeleted) {
        return response.status(HttpStatus.OK).json("Deleted a Smart Desk Type");
      } else {
        throw new HttpException("Smart Desk Type Does't Exists", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
