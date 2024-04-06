import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateInteractiveTypeDto } from "./dto/create-interactive-type.dto";
import { UpdateInteractiveTypeDto } from "./dto/update-interactive-type.dto";
import { Response } from "express";

@Injectable()
export class InteractiveTypesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(dto: CreateInteractiveTypeDto, response: Response) {
    try {
      const createInteractiveTypes =
        await this.prismaService.interactive_types.create({
          data: dto,
        });
      if (createInteractiveTypes) {
        return response.status(HttpStatus.OK).json("New InteractiveType Added");
      } else {
        throw new HttpException(
          "InteractiveType Not Added",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      const interactiveTypes =
        await this.prismaService.interactive_types.findMany({});
      if (interactiveTypes.length > 0) {
        return response.status(HttpStatus.OK).json(interactiveTypes);
      } else {
        throw new HttpException(
          "InteractiveTypes Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      const interactiveType =
        await this.prismaService.interactive_types.findUnique({
          where: {
            id: id,
          },
        });
      if (interactiveType) {
        return response.status(HttpStatus.OK).json(interactiveType);
      } else {
        throw new HttpException(
          "InteractiveType Not Found",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateInteractiveTypeDto, response: Response) {
    try {
      let updateInteractiveType =
        await this.prismaService.interactive_types.update({
          where: {
            id: id,
          },
          data: dto,
        });
      if (updateInteractiveType) {
        return response
          .status(HttpStatus.OK)
          .json("Updated an InteractiveType");
      } else {
        throw new HttpException(
          "InteractiveType Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let deleteInteractiveType =
        await this.prismaService.interactive_types.delete({
          where: {
            id: id,
          },
        });
      if (deleteInteractiveType) {
        return response
          .status(HttpStatus.OK)
          .json("Deleted an InteractiveType");
      } else {
        throw new HttpException(
          "InteractiveType Does't Exists",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
