import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateModuleSegmentTypeDto } from "./dto/create-module_segment_type.dto";
import { UpdateModuleSegmentTypeDto } from "./dto/update-module_segment_type.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class ModuleSegmentTypesService {
  constructor(private prismaService: PrismaService) {}
  async create(dto: CreateModuleSegmentTypeDto, response: Response) {
    try {
      let isModuleSegmentTypeExits =
        await this.prismaService.module_segment_types.findFirst({
          where: {
            title: dto.title,
          },
        });
      if (isModuleSegmentTypeExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("ModuleSegmentType already Exist!!");
      }

      let ModuleSegmentTypeCreated =
        await this.prismaService.module_segment_types.create({
          data: {
            title: dto.title,
            created_at:new Date().toISOString()
          },
        });
      if (ModuleSegmentTypeCreated) {
        return response.status(HttpStatus.OK).json(ModuleSegmentTypeCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let ModuleSegmentTypeFound =
        await this.prismaService.module_segment_types.findMany();
      if (ModuleSegmentTypeFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentTypeFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let ModuleSegmentTypeFound =
        await this.prismaService.module_segment_types.findUnique({
          where: {
            id: id,
          },
        });
      if (ModuleSegmentTypeFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentTypeFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    dto: UpdateModuleSegmentTypeDto,
    response: Response
  ) {
    try {
      let ModuleSegmentTypeFound =
        await this.prismaService.module_segment_types.update({
          where: {
            id: id,
          },
          data: {
            title: dto.title,
            updated_at:new Date().toISOString()
          },
        });
      if (ModuleSegmentTypeFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentTypeFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let ModuleSegmentTypeFound =
        await this.prismaService.module_segment_types.delete({
          where: {
            id: id,
          },
        });
      if (ModuleSegmentTypeFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentTypeFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
