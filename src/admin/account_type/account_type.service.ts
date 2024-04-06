import { HttpStatus, Injectable } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateAccountTypeDto } from "./dto/create-account_type.dto";
import { UpdateAccountTypeDto } from "./dto/update-account_type.dto";

@Injectable()
export class AccountTypeService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateAccountTypeDto, response: Response) {
    try {
      let isAccountTypeExits = await this.prisma.account_types.findFirst({
        where: {
          name: dto.accountTypeName,
        },
      });
      if (isAccountTypeExits) {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json("AccountType already Exist!!");
      }

      let AccountTypeCreated = await this.prisma.account_types.create({
        data: {
          name: dto.accountTypeName,
          created_at:new Date().toISOString()
        },
      });
      if (AccountTypeCreated) {
        return response.status(HttpStatus.OK).json(AccountTypeCreated);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findAll(response: Response) {
    try {
      let AccountTypesFound = await this.prisma.account_types.findMany();
      if (AccountTypesFound) {
        return response.status(HttpStatus.OK).json(AccountTypesFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response) {
    try {
      let AccountTypesFound = await this.prisma.account_types.findUnique({
        where: {
          id: id,
        },
      });
      if (AccountTypesFound) {
        return response.status(HttpStatus.OK).json(AccountTypesFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, dto: UpdateAccountTypeDto, response: Response) {
    try {
      let AccountTypesFound = await this.prisma.account_types.update({
        where: {
          id: id,
        },
        data: {
          name: dto.accountTypeName,
          updated_at:new Date().toISOString()
        },
      });
      if (AccountTypesFound) {
        return response.status(HttpStatus.OK).json(AccountTypesFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let AccountTypesFound = await this.prisma.account_types.delete({
        where: {
          id: id,
        },
      });
      if (AccountTypesFound) {
        return response.status(HttpStatus.OK).json(AccountTypesFound);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
