import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateExpertyLevelDto } from "./dto/create-experty_level.dto";
import { UpdateExpertyLevelDto } from "./dto/update-experty_level.dto";
import { Response } from "express";
@Injectable()
export class ExpertyLevelsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateExpertyLevelDto, response: Response) {
    try {
      let isExpertyLevelExits = await this.prisma.experty_levels.findFirst({
        where: {
          name: dto.ExpertyLevelTitle,
        },
      });
      if (isExpertyLevelExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("ExpertyLevel already Exist!!");
      }

      let ExpertyLevelCreated = await this.prisma.experty_levels.create({
        data: {
          name: dto.ExpertyLevelTitle,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (ExpertyLevelCreated) {
        return response.status(HttpStatus.OK).json(ExpertyLevelCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isExpertyLevelFound = await this.prisma.experty_levels.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      if (isExpertyLevelFound) {
        return response.status(HttpStatus.OK).json(isExpertyLevelFound);
      } else {
        throw new HttpException(
          "ExpertyLevel Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let ExpertyLevelFound = await this.prisma.experty_levels.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (ExpertyLevelFound) {
        return response.status(HttpStatus.OK).json(ExpertyLevelFound);
      } else {
        throw new HttpException(
          "ExpertyLevel Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateExpertyLevelDto, response: Response) {
    try {
      let isExpertyLevelUpdated = await this.prisma.experty_levels.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
        data: {
          name: dto.ExpertyLevelTitle,
          updated_at:new Date().toISOString()
        },
      });
      if (isExpertyLevelUpdated) {
        return response.status(HttpStatus.OK).json(isExpertyLevelUpdated);
      } else {
        throw new HttpException(
          "ExpertyLevel Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isExpertyLevelFound = await this.prisma.experty_levels.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (isExpertyLevelFound) {
        return response.status(HttpStatus.OK).json(isExpertyLevelFound);
      } else {
        throw new HttpException(
          "ExpertyLevel Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
