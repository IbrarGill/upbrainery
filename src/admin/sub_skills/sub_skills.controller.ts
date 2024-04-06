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
import { SubSkillsService } from "./sub_skills.service";
import { CreateSubSkillDto } from "./dto/create-sub_skill.dto";
import { UpdateSubSkillDto } from "./dto/update-sub_skill.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/sub-skills")

export class SubSkillsController {
  constructor(private readonly subSkillsService: SubSkillsService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createSubSkillDto: CreateSubSkillDto,
    @Res() response: Response
  ) {
    return this.subSkillsService.create(createSubSkillDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.subSkillsService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subSkillsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSubSkillDto: UpdateSubSkillDto,
    @Res() response: Response
  ) {
    return this.subSkillsService.update(id, updateSubSkillDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.subSkillsService.remove(id, response);
  }
}
