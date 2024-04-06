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
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AvailabilitiesService } from "./availabilities.service";
import { CreateAvailabilityDto } from "./dto/create-availability.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/admin/availabilities")

export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @Res() response: Response
  ) {
    return this.availabilitiesService.create(createAvailabilityDto, response);
  }

  @Get("all")
  findAll(@Res() response: Response) {
    return this.availabilitiesService.findAll(response);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.availabilitiesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Res() response: Response
  ) {
    return this.availabilitiesService.update(
      +id,
      updateAvailabilityDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.availabilitiesService.remove(id, response);
  }
}
