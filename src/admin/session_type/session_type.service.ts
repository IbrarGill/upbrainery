import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { CreateSessionTypeDto } from "./dto/create-session_type.dto";
import { UpdateSessionTypeDto } from "./dto/update-session_type.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
@Injectable()
export class SessionTypeService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateSessionTypeDto, response: Response) {
    try {
      let isSessionTypeExits = await this.prisma.session_types.findFirst({
        where: {
          name: dto.sessionName,
        },
      });
      if (isSessionTypeExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("SessionType already Exist!!");
      }

      let SessionTypeCreated = await this.prisma.session_types.create({
        data: {
          name: dto.sessionName,
          created_at:new Date().toISOString()
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (SessionTypeCreated) {
        return response.status(HttpStatus.OK).json(SessionTypeCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let isSessionTypeFound = await this.prisma.session_types.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      if (isSessionTypeFound) {
        return response.status(HttpStatus.OK).json(isSessionTypeFound);
      } else {
        throw new HttpException(
          "SessionType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let SessionTypeFound = await this.prisma.session_types.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (SessionTypeFound) {
        return response.status(HttpStatus.OK).json(SessionTypeFound);
      } else {
        throw new HttpException(
          "SessionType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateSessionTypeDto, response: Response) {
    try {
      let isSessionTypeUpdated = await this.prisma.session_types.update({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
        data: {
          name: dto.sessionName,
          updated_at:new Date().toISOString()
        },
      });
      if (isSessionTypeUpdated) {
        return response.status(HttpStatus.OK).json(isSessionTypeUpdated);
      } else {
        throw new HttpException(
          "SessionType Not Updated!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let isSessionTypeFound = await this.prisma.session_types.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (isSessionTypeFound) {
        return response.status(HttpStatus.OK).json(isSessionTypeFound);
      } else {
        throw new HttpException(
          "SessionType Not Found!!",
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
