import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { QueryUserDto, UserNotificationQuery } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/authStrategy/guard";
import { Request, Response } from "express";
import { Roles, role } from "src/authStrategy/roleGuard/role";
@ApiTags("User")
@Controller()
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
@Roles(role.ORGANIZATION,role.ADMIN,role.LEARNER,role.INSTRUCTOR,role.PARENT)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('all')
  findAll(@Query() query: QueryUserDto, @Res() response: Response, @Req() request: Request) {
    return this.userService.findAll(query, response, request);
  }


  @Get(":id")
  findOne(@Param("id") id: number, @Res() response: Response, @Req() request: Request) {
    return this.userService.findOne(id, response, request);
  }

  @Get("instructor/:id")
  findinstructorLeaner(@Param("id") id: number, @Res() response: Response) {
    return this.userService.findinstuctorLeanerList(id, response);
  }


  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response
  ) {
    return this.userService.update(+id, updateUserDto, response);
  }


  @Delete(":id")
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.userService.remove(+id, response);
  }


  @Get("learner/activity")
  learneractivity(@Res() response: Response) {
    return this.userService.learneractivity(response);
  }
}
