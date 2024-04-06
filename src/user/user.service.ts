import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { CreateUserDto, QueryUserDto, UserNotificationQuery } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request, Response } from "express";
import { CommonFunctionsService } from "src/services/commonService";
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private serverFunctions: CommonFunctionsService
  ) { }

  async findAll(query: QueryUserDto, response: Response, request: Request) {
    try {
      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let accountType = await this.prisma.account_types.findUnique({
        where: {
          name: query.AccountType
        }
      })
      let allUsers: any = await this.prisma.users.findMany({
        skip: pageNo * limit,
        take: query?.limit,
        where: {
          is_block: false,
          account_type_id: accountType ? accountType.id : undefined,
          email_verified_at: {
            not: null
          }
        }
      });
      if (allUsers) {
        for (const item of allUsers) {
          const attachments = await this.serverFunctions.getAttachments(
            item.id,
            "User"
          );
          item.attachments = attachments;
          delete item.password;
          delete item.refresh_token;
        }
        return response.status(HttpStatus.OK).json(allUsers);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findOne(id: number, response: Response, request: Request) {
    try {
      let user: any = await this.prisma.users.findUnique({
        where: {
          id: id
        },
        include: {
          account_types: {
            select: {
              id: true,
              name: true
            }
          },
          roles: {
            select: {
              name: true,
            }
          },
          organizations: true
        },
      });

      if (user) {
        let attachments = await this.serverFunctions.getAttachments(
          user.id,
          "User"
        );
        let org_user = await this.prisma.users.findFirst({
          where: {
            organization_id: user.organization_id,
            account_type_id: 4
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            user_name: true
          }
        })

        user.org_user = org_user;
        user.attachments = attachments;
        delete user.refresh_token;
        delete user.password;

        return response.status(HttpStatus.OK).json(user);
      } else {
        throw new HttpException("User not found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async findinstuctorLeanerList(instructor_id: number, response: Response) {
    try {
      let user: any = await this.prisma.users.findFirst({
        where: {
          id: instructor_id,
          account_types: {
            AND: {
              name: 'Instructor'
            }
          }
        },
        include: {
          user_manager_user_manager_manager_idTousers: {
            select: {
              users_user_manager_manager_idTousers: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true
                }
              }
            }
          }
        },
      });

      if (user) {
        let attachments: any = await this.serverFunctions.getAttachments(
          user.id,
          "User"
        );
        user.attachments = attachments;
        delete user.refresh_token;
        delete user.password;

        return response.status(HttpStatus.OK).json(user);
      } else {
        throw new HttpException("Instructor not found!!", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, response: Response) {
    try {
      let user = await this.prisma.users.update({
        where: {
          id: id,
        },
        data: updateUserDto,
      });
      if (user) {
        delete user.password;
        delete user.refresh_token;
        return user;
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async remove(id: number, response: Response) {
    try {
      let user = await this.prisma.users.delete({
        where: {
          id: id,
        },
      });
      if (user) {
        if (user.account_type_id) delete user.refresh_token;
        delete user.password;
        return user;
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }



  async learneractivity(response: Response) {
    try {
      let user = await this.prisma.user_sessions.findMany({
        select: {
          users: {
            select: {
              id: true,
              user_name: true,
              organization_id: true,
              account_type_id: true
            }
          }
        }
      });
      if (user) {
        response.status(HttpStatus.OK).json(user)
      }
    } catch (error) {
      console.log(error)
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
