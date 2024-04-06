import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { ExpierenceService } from "./expierence.service";
import { CreateExpierenceDto } from "./dto/create-expierence.dto";
import { UpdateExpierenceDto } from "./dto/update-expierence.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import {
  DeleteExpierence,
  ExperinceEntity,
  RegistereExpierence,
  UpdateExpierence,
} from "./entities/expierence.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("admin/expierence")

export class ExpierenceController {
  constructor(private readonly expierenceService: ExpierenceService) { }
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegistereExpierence,
  })
  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createExpierenceDto: CreateExpierenceDto,
    @Res() response: Response
  ) {
    return this.expierenceService.create(createExpierenceDto, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ExperinceEntity],
  })
  @Get("all")
  findAll(@Res() response: Response) {
    return this.expierenceService.findAll(response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExperinceEntity,
  })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.expierenceService.findOne(id, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateExpierence,
  })
  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExpierenceDto: UpdateExpierenceDto,
    @Res() response: Response
  ) {
    return this.expierenceService.update(id, updateExpierenceDto, response);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteExpierence,
  })
  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.expierenceService.remove(id, response);
  }
}
