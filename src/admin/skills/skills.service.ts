import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateSkillDto, response: Response) {
    try {
      let isSkillExits = await this.prisma.skills.findFirst({
        where: {
          title: dto.skillName,
        },
      });
      if (isSkillExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Skill already Exist!!");
      }

      let SkillCreated = await this.prisma.skills.create({
        data: {
          title: dto.skillName,
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
      let isSkillFound = await this.prisma.skills.findMany({
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
      let SkillFound = await this.prisma.skills.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          sub_skills:{
            select:{
              id: true,
              title: true,
            }
          }

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

  async update(id: number, dto: UpdateSkillDto, response: Response) {
    try {
      let isSkillUpdated = await this.prisma.skills.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
        data: {
          title: dto.skillName,
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
      let isSkillFound = await this.prisma.skills.delete({
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
