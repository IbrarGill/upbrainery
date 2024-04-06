import {
  Controller,
  Res,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CertificationsLevelsService } from "./certifications-levels.service";
import {
  CreateCertificationsLevelDto,
  SearchCLusterPathwayDto,
} from "./dto/create-certifications-level.dto";
import { UpdateCertificationsLevelDto } from "./dto/update-certifications-level.dto";
import { Response } from "express";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("Certifications-Level")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class CertificationsLevelsController {
  constructor(
    private readonly certificationsLevelsService: CertificationsLevelsService
  ) {}

  @Post()
  create(
    @Body() createCertificationsLevelDto: CreateCertificationsLevelDto,
    @Res() response: Response
  ) {
    return this.certificationsLevelsService.create(
      createCertificationsLevelDto,
      response
    );
  }

  @Get()
  findAll(@Res() response: Response, @Query() query: SearchCLusterPathwayDto) {
    return this.certificationsLevelsService.findAll(response, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.certificationsLevelsService.findOne(+id, response);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCertificationsLevelDto: UpdateCertificationsLevelDto,
    @Res() response: Response
  ) {
    return this.certificationsLevelsService.update(
      +id,
      updateCertificationsLevelDto,
      response
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.certificationsLevelsService.remove(+id, response);
  }
}
