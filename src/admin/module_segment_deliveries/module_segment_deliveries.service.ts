import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateModuleSegmentDeliveryDto } from "./dto/create-module_segment_delivery.dto";
import { UpdateModuleSegmentDeliveryDto } from "./dto/update-module_segment_delivery.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";

@Injectable()
export class ModuleSegmentDeliveriesService {
  constructor(private prismaService: PrismaService) {}
  async create(dto: CreateModuleSegmentDeliveryDto, response: Response) {
    try {
      let isModuleSegmentDeliveryExits =
        await this.prismaService.module_segment_deliveries.findFirst({
          where: {
            title: dto.title,
          },
        });
      if (isModuleSegmentDeliveryExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("ModuleSegmentDelivery already Exist!!");
      }

      let ModuleSegmentDeliveryCreated =
        await this.prismaService.module_segment_deliveries.create({
          data: {
            title: dto.title,
            created_at:new Date().toISOString()
          },
        });
      if (ModuleSegmentDeliveryCreated) {
        return response
          .status(HttpStatus.OK)
          .json(ModuleSegmentDeliveryCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let ModuleSegmentDeliveryFound =
        await this.prismaService.module_segment_deliveries.findMany();
      if (ModuleSegmentDeliveryFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentDeliveryFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let ModuleSegmentDeliveryFound =
        await this.prismaService.module_segment_deliveries.findUnique({
          where: {
            id: id,
          },
        });
      if (ModuleSegmentDeliveryFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentDeliveryFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    dto: UpdateModuleSegmentDeliveryDto,
    response: Response
  ) {
    try {
      let ModuleSegmentDeliveryFound =
        await this.prismaService.module_segment_deliveries.update({
          where: {
            id: id,
          },
          data: {
            title: dto.title,
            updated_at:new Date().toISOString()
          },
        });
      if (ModuleSegmentDeliveryFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentDeliveryFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let ModuleSegmentDeliveryFound =
        await this.prismaService.module_segment_deliveries.delete({
          where: {
            id: id,
          },
        });
      if (ModuleSegmentDeliveryFound) {
        return response.status(HttpStatus.OK).json(ModuleSegmentDeliveryFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
