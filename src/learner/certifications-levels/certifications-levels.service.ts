import { HttpStatus, Injectable } from "@nestjs/common";
import {
  CreateCertificationsLevelDto,
  SearchCLusterPathwayDto,
} from "./dto/create-certifications-level.dto";
import { UpdateCertificationsLevelDto } from "./dto/update-certifications-level.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class CertificationsLevelsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateCertificationsLevelDto, response: Response) {
    try {
      let isCertificationLevelExits =
        await this.prisma.certification_levels.findFirst({
          where: {
            title: dto.title,
          },
        });
      if (isCertificationLevelExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("CertificationLevel already Exist!!");
      }

      let CertificationLevelCreated =
        await this.prisma.certification_levels.create({
          data: {
            title: dto.title,
            created_at: new Date().toISOString(),
          },
        });
      if (CertificationLevelCreated) {
        return response.status(HttpStatus.OK).json(CertificationLevelCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response, query: SearchCLusterPathwayDto) {
    try {
      let CertificationLevelsFound =
        await this.prisma.certification_levels.findMany({
          where: {
            title: {
              contains: query.title ?? undefined,
            },
            is_active: true,
          },
        });
      if (CertificationLevelsFound) {
        return response.status(HttpStatus.OK).json(CertificationLevelsFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let CertificationLevelsFound =
        await this.prisma.certification_levels.findUnique({
          where: {
            id: id,
          },
        });
      if (CertificationLevelsFound) {
        return response.status(HttpStatus.OK).json(CertificationLevelsFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    dto: UpdateCertificationsLevelDto,
    response: Response
  ) {
    try {
      let CertificationLevelsFound =
        await this.prisma.certification_levels.update({
          where: {
            id: id,
          },
          data: {
            title: dto.title,
            updated_at: new Date().toISOString(),
          },
        });
      if (CertificationLevelsFound) {
        return response.status(HttpStatus.OK).json(CertificationLevelsFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let CertificationLevelsFound = await this.prisma.account_types.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
        },
      });
      if (CertificationLevelsFound) {
        return response.status(HttpStatus.OK).json(CertificationLevelsFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
