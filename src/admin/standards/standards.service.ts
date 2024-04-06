import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateStandardDto } from "./dto/create-standard.dto";
import { UpdateStandardDto } from "./dto/update-standard.dto";
import { Response } from "express";
@Injectable()
export class StandardsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateStandardDto, response: Response) {
    try {
      let isSkillExits = await this.prisma.standards.findFirst({
        where: {
          title: dto.title,
        },
      });
      if (isSkillExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Skill already Exist!!");
      }

      let SkillCreated = await this.prisma.standards.create({
        data: {
          title: dto.title,
          standard_type_id: dto.standard_type_id,
          standard_level_id: dto.standard_level_id,
          standard_subject_id: dto.standard_subject_id,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
          standard_types: {
            select: {
              id: true,
              title: true,
            },
          },
          standard_levels: {
            select: {
              id: true,
              title: true,
              standard_type_id: true,
            },
          },
          standard_subjects: {
            select: {
              id: true,
              title: true,
              standard_level_id: true,
            },
          },
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
      let isSkillFound = await this.prisma.standards.findMany({
        select: {
          id: true,
          title: true,
          standard_types: {
            select: {
              id: true,
              title: true,
            },
          },
          standard_levels: {
            select: {
              id: true,
              title: true,
              standard_type_id: true,
            },
          },
          standard_subjects: {
            select: {
              id: true,
              title: true,
              standard_level_id: true,
            },
          },
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
      let SkillFound = await this.prisma.standards.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_types: {
            select: {
              id: true,
              title: true,
            },
          },
          standard_levels: {
            select: {
              id: true,
              title: true,
              standard_type_id: true,
            },
          },
          standard_subjects: {
            select: {
              id: true,
              title: true,
              standard_level_id: true,
            },
          },
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

  async update(id: number, dto: UpdateStandardDto, response: Response) {
    try {
      let isSkillUpdated = await this.prisma.standards.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_types: {
            select: {
              id: true,
              title: true,
            },
          },
          standard_levels: {
            select: {
              id: true,
              title: true,
              standard_type_id: true,
            },
          },
          standard_subjects: {
            select: {
              id: true,
              title: true,
              standard_level_id: true,
            },
          },
        },
        data: {
          title: dto.title,
          standard_type_id: dto.standard_type_id,
          standard_level_id: dto.standard_level_id,
          standard_subject_id: dto.standard_subject_id,
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
      let isSkillFound = await this.prisma.standards.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_types: true,
          standard_levels: true,
          standard_subjects: true,
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
