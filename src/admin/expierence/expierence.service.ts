import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateExpierenceDto } from "./dto/create-expierence.dto";
import { UpdateExpierenceDto } from "./dto/update-expierence.dto";
import { Response, Request } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
@Injectable()
export class ExpierenceService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createExpierenceDto: CreateExpierenceDto, response: Response) {
    try {
      const createExperience = await this.prismaService.experty_levels.create({
        data: createExpierenceDto,
      });
      if (createExperience) {
        return response.status(HttpStatus.OK).json("New Experience Added");
      } else {
        throw new HttpException("Experience Not Added", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const experiences = await this.prismaService.experty_levels.findMany({});
      if (experiences) {
        return response.status(HttpStatus.OK).json(experiences);
      } else {
        throw new HttpException(
          "Experience Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const experience = await this.prismaService.experty_levels.findUnique({
        where: {
          id: id,
        },
      });
      if (experience) {
        return response.status(HttpStatus.OK).json(experience);
      } else {
        throw new HttpException("Experience Not Found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(
    id: number,
    updateExpierenceDto: UpdateExpierenceDto,
    response: Response
  ) {
    try {
      let updateExperience = await this.prismaService.experty_levels.update({
        where: {
          id: id,
        },
        data: updateExpierenceDto,
      });
      if (updateExperience) {
        return response.status(HttpStatus.OK).json("Updated an Experience");
      } else {
        throw new HttpException(
          "Experience Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteExperience = await this.prismaService.experty_levels.delete({
        where: {
          id: id,
        },
      });
      if (deleteExperience) {
        return response.status(HttpStatus.OK).json("Deleted an Experience");
      } else {
        throw new HttpException(
          "Experience Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
