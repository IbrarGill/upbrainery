import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateSubSkillDto } from "./dto/create-sub_skill.dto";
import { UpdateSubSkillDto } from "./dto/update-sub_skill.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
@Injectable()
export class SubSkillsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateSubSkillDto, response: Response) {
    try {
      let isSubSkillExits = await this.prisma.sub_skills.findFirst({
        where: {
          title: dto.title,
        },
      });
      if (isSubSkillExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("SubSkill already Exist!!");
      }

      let SubSkillCreated = await this.prisma.sub_skills.create({
        data: {
          title: dto.title,
          skill_id: dto.skillId,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
          skill_id: true,
        },
      });
      if (SubSkillCreated) {
        return response.status(HttpStatus.OK).json(SubSkillCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isSubSkillFound = await this.prisma.sub_skills.findMany({
        select: {
          id: true,
          title: true,
          skill_id: true,
        },
      });
      if (isSubSkillFound) {
        return response.status(HttpStatus.OK).json(isSubSkillFound);
      } else {
        throw new HttpException("SubSkill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let SubSkillFound = await this.prisma.sub_skills.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          skill_id: true,
        },
      });
      if (SubSkillFound) {
        return response.status(HttpStatus.OK).json(SubSkillFound);
      } else {
        throw new HttpException("SubSkill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateSubSkillDto, response: Response) {
    try {
      let isSubSkillUpdated = await this.prisma.sub_skills.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          skill_id: true,
        },
        data: {
          title: dto.title,
          updated_at:new Date().toISOString()
        },
      });
      if (isSubSkillUpdated) {
        return response.status(HttpStatus.OK).json(isSubSkillUpdated);
      } else {
        throw new HttpException("SubSkill Not Updated!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSubSkillFound = await this.prisma.sub_skills.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          skill_id: true,
        },
      });
      if (isSubSkillFound) {
        return response.status(HttpStatus.OK).json(isSubSkillFound);
      } else {
        throw new HttpException("SubSkill Not Found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
