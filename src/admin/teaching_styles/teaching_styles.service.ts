import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateTeachingStyleDto } from "./dto/create-teaching_style.dto";
import { UpdateTeachingStyleDto } from "./dto/update-teaching_style.dto";
import { Response } from "express";
@Injectable()
export class TeachingStylesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateTeachingStyleDto, response: Response) {
    try {
      let isTechingStyleExits = await this.prisma.teaching_styles.findFirst({
        where: {
          name: dto.techingStyleName,
        },
      });
      if (isTechingStyleExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("TechingStyle already Exist!!");
      }

      let TechingStyleCreated = await this.prisma.teaching_styles.create({
        data: {
          name: dto.techingStyleName,
          updated_at:new Date().toISOString()
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (TechingStyleCreated) {
        return response.status(HttpStatus.OK).json(TechingStyleCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isTechingStyleFound = await this.prisma.teaching_styles.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      if (isTechingStyleFound) {
        return response.status(HttpStatus.OK).json(isTechingStyleFound);
      } else {
        throw new HttpException(
          "TechingStyle Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let TechingStyleFound = await this.prisma.teaching_styles.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (TechingStyleFound) {
        return response.status(HttpStatus.OK).json(TechingStyleFound);
      } else {
        throw new HttpException(
          "TechingStyle Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateTeachingStyleDto, response: Response) {
    try {
      let TechingStyleUpdated = await this.prisma.teaching_styles.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
        data: {
          name: dto.techingStyleName,
          updated_at:new Date().toISOString()
        },
      });
      if (TechingStyleUpdated) {
        return response.status(HttpStatus.OK).json(TechingStyleUpdated);
      } else {
        throw new HttpException(
          "TechingStyle Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isTechingStyleFound = await this.prisma.teaching_styles.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (isTechingStyleFound) {
        return response.status(HttpStatus.OK).json(isTechingStyleFound);
      } else {
        throw new HttpException(
          "TechingStyle Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
