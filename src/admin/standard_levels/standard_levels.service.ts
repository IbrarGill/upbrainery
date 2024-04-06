import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateStandardLevelDto } from "./dto/create-standard_level.dto";
import { UpdateStandardLevelDto } from "./dto/update-standard_level.dto";
import { Response } from "express";
@Injectable()
export class StandardLevelsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateStandardLevelDto, response: Response) {
    try {
      let isStandardLevelExits = await this.prisma.standard_levels.findFirst({
        where: {
          title: dto.title,
          
        },
      });
      if (isStandardLevelExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Standard_levels already Exist!!");
      }

      let StandardLevelCreated = await this.prisma.standard_levels.create({
        data: {
          title: dto.title,
          standard_type_id: dto.standarTypeId,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
          standard_type_id: true,
        },
      });
      if (StandardLevelCreated) {
        return response.status(HttpStatus.OK).json(StandardLevelCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isStandardLevelFound = await this.prisma.standard_levels.findMany({
        select: {
          id: true,
          title: true,
          standard_type_id: true,
        },
      });
      if (isStandardLevelFound) {
        return response.status(HttpStatus.OK).json(isStandardLevelFound);
      } else {
        throw new HttpException(
          "Standard_levels Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let StandardLevelFound = await this.prisma.standard_levels.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_subjects: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      if (StandardLevelFound) {
        return response.status(HttpStatus.OK).json(StandardLevelFound);
      } else {
        throw new HttpException(
          "Standard_levels Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateStandardLevelDto, response: Response) {
    try {
      let isStandardLevelUpdated = await this.prisma.standard_levels.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_type_id: true,
        },
        data: {
          title: dto.title,
          updated_at:new Date().toISOString()
        },
      });
      if (isStandardLevelUpdated) {
        return response.status(HttpStatus.OK).json(isStandardLevelUpdated);
      } else {
        throw new HttpException(
          "Standard_levels Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isStandardLevelFound = await this.prisma.standard_levels.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_type_id: true,
        },
      });
      if (isStandardLevelFound) {
        return response.status(HttpStatus.OK).json(isStandardLevelFound);
      } else {
        throw new HttpException(
          "Standard_levels Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
