import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { WorkingTypesService } from "./working_types.service";
import { CreateWorkingTypeDto } from "./dto/create-working_type.dto";
import { UpdateWorkingTypeDto } from "./dto/update-working_type.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/working-types")

export class WorkingTypesController {
  constructor(private readonly workingTypesService: WorkingTypesService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createWorkingTypeDto: CreateWorkingTypeDto,
    @Res() response: Response
  ) {
    return this.workingTypesService.create(createWorkingTypeDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.workingTypesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.workingTypesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateWorkingTypeDto: UpdateWorkingTypeDto,
    @Res() response: Response
  ) {
    return this.workingTypesService.update(id, updateWorkingTypeDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.workingTypesService.remove(id, response);
  }
}
