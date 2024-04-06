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
import { SkillsService } from "./skills.service";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/skills")

export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(@Body() createSkillDto: CreateSkillDto, @Res() response: Response) {
    return this.skillsService.create(createSkillDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.skillsService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.skillsService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
    @Res() response: Response
  ) {
    return this.skillsService.update(id, updateSkillDto, response);
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.skillsService.remove(id, response);
  }
}
