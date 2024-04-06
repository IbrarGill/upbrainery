import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ClassTypesService } from "./class_types.service";
import { CreateClassTypeDto } from "./dto/create-class_type.dto";
import { UpdateClassTypeDto } from "./dto/update-class_type.dto";
import { Response, } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/class-types")

export class ClassTypesController {
  constructor(private readonly classTypesService: ClassTypesService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(@Body() createClassTypeDto: CreateClassTypeDto, @Res() response: Response) {
    return this.classTypesService.create(createClassTypeDto, response);
  }

  @Get('all')
  findAll(@Res() response: Response) {
    return this.classTypesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id") id: number, @Res() response: Response) {
    return this.classTypesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id") id: number,
    @Body() updateClassTypeDto: UpdateClassTypeDto,
    @Res() response: Response
  ) {
    return this.classTypesService.update(id, updateClassTypeDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id") id: number, @Res() response: Response) {
    return this.classTypesService.remove(id, response);
  }
}
