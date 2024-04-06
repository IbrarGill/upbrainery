import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateStandardSubjectDto } from "./dto/create-standard_subject.dto";
import { UpdateStandardSubjectDto } from "./dto/update-standard_subject.dto";
import { Response } from "express";
@Injectable()
export class StandardSubjectsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateStandardSubjectDto, response: Response) {
    try {
      let isStandardSubjectExits =
        await this.prisma.standard_subjects.findFirst({
          where: {
            title: dto.title,
          },
        });
      if (isStandardSubjectExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Standard subjects already Exist!!");
      }

      let StandardSubjectCreated = await this.prisma.standard_subjects.create({
        data: {
          title: dto.title,
          standard_level_id: dto.standardLevelId,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          title: true,
          standard_level_id: true,
        },
      });
      if (StandardSubjectCreated) {
        return response.status(HttpStatus.OK).json(StandardSubjectCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isStandardSubjectFound = await this.prisma.standard_subjects.findMany(
        {
          select: {
            id: true,
            title: true,
            standard_level_id: true,
          },
        }
      );
      if (isStandardSubjectFound) {
        return response.status(HttpStatus.OK).json(isStandardSubjectFound);
      } else {
        throw new HttpException(
          "Standard subjects Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let StandardSubjectFound = await this.prisma.standard_subjects.findUnique(
        {
          where: {
            id: id,
          },
          select: {
            id: true,
            title: true,
            standards: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }
      );
      if (StandardSubjectFound) {
        return response.status(HttpStatus.OK).json(StandardSubjectFound);
      } else {
        throw new HttpException(
          "Standard subjects Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateStandardSubjectDto, response: Response) {
    try {
      let isStandardSubjectUpdated = await this.prisma.standard_subjects.update(
        {
          where: {
            id: id,
          },
          select: {
            id: true,
            title: true,
            standard_level_id: true,
          },
          data: {
            title: dto.title,
            standard_level_id: dto.standardLevelId,
            updated_at:new Date().toISOString()
          },
        }
      );
      if (isStandardSubjectUpdated) {
        return response.status(HttpStatus.OK).json(isStandardSubjectUpdated);
      } else {
        throw new HttpException(
          "Standard subjects Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isStandardSubjectFound = await this.prisma.standard_subjects.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          standard_level_id: true,
        },
      });
      if (isStandardSubjectFound) {
        return response.status(HttpStatus.OK).json(isStandardSubjectFound);
      } else {
        throw new HttpException(
          "Standard subjects Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
