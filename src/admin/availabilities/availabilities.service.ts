import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateAvailabilityDto } from "./dto/create-availability.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
@Injectable()
export class AvailabilitiesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateAvailabilityDto, response: Response) {
    try {
      let isAvailaviltyExits = await this.prisma.availabilities.findFirst({
        where: {
          title: dto.availabilityTitle,
        },
      });
      if (isAvailaviltyExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("Availability already Exist!!");
      }

      let AvailabilityCreated = await this.prisma.availabilities.create({
        data: {
          title: dto.availabilityTitle,
          created_at:new Date().toISOString()
        },
      });
      if (AvailabilityCreated) {
        return response.status(HttpStatus.OK).json(AvailabilityCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isAvailabilityFound = await this.prisma.availabilities.findMany({
        select: {
          id: true,
          title: true,
        },
      });
      if (isAvailabilityFound) {
        return response.status(HttpStatus.OK).json(isAvailabilityFound);
      } else {
        throw new HttpException(
          "Availabilities Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let AvailabilityFound = await this.prisma.availabilities.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (AvailabilityFound) {
        return response.status(HttpStatus.OK).json(AvailabilityFound);
      } else {
        throw new HttpException(
          "Availability Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateAvailabilityDto, response: Response) {
    try {
      let isAvailabilityUpdated = await this.prisma.availabilities.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
        data: {
          title: dto.availabilityTitle,
          updated_at:new Date().toISOString()
        },
      });
      if (isAvailabilityUpdated) {
        return response.status(HttpStatus.OK).json(isAvailabilityUpdated);
      } else {
        throw new HttpException(
          "Availability Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isAvailabilityFound = await this.prisma.availabilities.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
        },
      });
      if (isAvailabilityFound) {
        return response.status(HttpStatus.OK).json(isAvailabilityFound);
      } else {
        throw new HttpException(
          "Availability Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
