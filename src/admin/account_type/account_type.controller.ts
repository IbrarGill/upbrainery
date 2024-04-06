import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { AccountTypeService } from "./account_type.service";
import { CreateAccountTypeDto } from "./dto/create-account_type.dto";
import { UpdateAccountTypeDto } from "./dto/update-account_type.dto";
import { Response } from "express";
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  AccountTypeEntity,
  DeleteAccounttype,
  RegisteredAccounttype,
  UpdateAccounttype,
} from "./entities/account_type.entity";
import { JwtGuard } from "src/authStrategy/guard";
@ApiTags("/admin/account-type")
@Controller("")

export class AccountTypeController {
  constructor(private readonly accountTypeService: AccountTypeService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredAccounttype,
  })
  create(
    @Body() createAccountTypeDto: CreateAccountTypeDto,
    @Res() response: Response
  ) {
    return this.accountTypeService.create(createAccountTypeDto, response);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AccountTypeEntity],
  })
  findAll(@Res() response: Response) {
    return this.accountTypeService.findAll(response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountTypeEntity,
  })
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.accountTypeService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateAccounttype,
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
    @Res() response: Response
  ) {
    return this.accountTypeService.update(id, updateAccountTypeDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteAccounttype,
  })
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.accountTypeService.remove(id, response);
  }
}
