import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateStandardTypeDto } from "./dto/create-standard_type.dto";
import { UpdateStandardTypeDto } from "./dto/update-standard_type.dto";
import { Response } from "express";
@Injectable()
export class StandardTypesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateStandardTypeDto, response: Response) {
    try {
      let isStandardTypeExits = await this.prisma.standard_types.findFirst({
        where: {
          title: dto.standardType,
        },
      });
      if (isStandardTypeExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("StandardType already Exist!!");
      }

      let StandardTypeCreated = await this.prisma.standard_types.create({
        data: {
          title: dto.standardType,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (StandardTypeCreated) {
        return response.status(HttpStatus.OK).json(StandardTypeCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isStandardTypeFound = await this.prisma.standard_types.findMany({
        select: {
          id: true,
          title: true,
        },
      });
      if (isStandardTypeFound) {
        return response.status(HttpStatus.OK).json(isStandardTypeFound);
      } else {
        throw new HttpException(
          "StandardType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let StandardTypeFound = await this.prisma.standard_types.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_levels: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      if (StandardTypeFound) {
        return response.status(HttpStatus.OK).json(StandardTypeFound);
      } else {
        throw new HttpException(
          "StandardType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateStandardTypeDto, response: Response) {
    try {
      let isStandardTypeUpdated = await this.prisma.standard_types.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
        data: {
          title: dto.standardType,
          updated_at:new Date().toISOString()
        },
      });
      if (isStandardTypeUpdated) {
        return response.status(HttpStatus.OK).json(isStandardTypeUpdated);
      } else {
        throw new HttpException(
          "StandardType Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSkillFound = await this.prisma.standard_types.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (isSkillFound) {
        return response.status(HttpStatus.OK).json(isSkillFound);
      } else {
        throw new HttpException(
          "StandardType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
