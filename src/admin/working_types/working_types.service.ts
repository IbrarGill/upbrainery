import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateWorkingTypeDto } from "./dto/create-working_type.dto";
import { UpdateWorkingTypeDto } from "./dto/update-working_type.dto";
import { Response } from "express";
@Injectable()
export class WorkingTypesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateWorkingTypeDto, response: Response) {
    try {
      let isSkillExits = await this.prisma.working_types.findFirst({
        where: {
          title: dto.workingType,
        },
      });
      if (isSkillExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("SessionType already Exist!!");
      }

      let SkillCreated = await this.prisma.working_types.create({
        data: {
          title: dto.workingType,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (SkillCreated) {
        return response.status(HttpStatus.OK).json(SkillCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isSkillFound = await this.prisma.working_types.findMany({
        select: {
          id: true,
          title: true,
        },
      });
      if (isSkillFound) {
        return response.status(HttpStatus.OK).json(isSkillFound);
      } else {
        throw new HttpException("Skill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let SkillFound = await this.prisma.working_types.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (SkillFound) {
        return response.status(HttpStatus.OK).json(SkillFound);
      } else {
        throw new HttpException("Skill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateWorkingTypeDto, response: Response) {
    try {
      let isSkillUpdated = await this.prisma.working_types.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
        data: {
          title: dto.workingType,
          updated_at:new Date().toISOString()
        },
      });
      if (isSkillUpdated) {
        return response.status(HttpStatus.OK).json(isSkillUpdated);
      } else {
        throw new HttpException("Skill Not Updated!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSkillFound = await this.prisma.working_types.delete({
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
        throw new HttpException("Skill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
