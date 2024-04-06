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
import { TeachingStylesService } from "./teaching_styles.service";
import { CreateTeachingStyleDto } from "./dto/create-teaching_style.dto";
import { UpdateTeachingStyleDto } from "./dto/update-teaching_style.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/teaching-styles")

export class TeachingStylesController {
  constructor(private readonly teachingStylesService: TeachingStylesService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createTeachingStyleDto: CreateTeachingStyleDto,
    @Res() response: Response
  ) {
    return this.teachingStylesService.create(createTeachingStyleDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.teachingStylesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.teachingStylesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeachingStyleDto: UpdateTeachingStyleDto,
    @Res() response: Response
  ) {
    return this.teachingStylesService.update(
      id,
      updateTeachingStyleDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.teachingStylesService.remove(id, response);
  }
}
