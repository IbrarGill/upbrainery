import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { InteractiveTypesService } from "./interactive-types.service";
import { CreateInteractiveTypeDto } from "./dto/create-interactive-type.dto";
import { UpdateInteractiveTypeDto } from "./dto/update-interactive-type.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  DeleteInteractiveType,
  InteractiveTypeEntity,
  RegistereInteractiveType,
  UpdateInteractiveType,
} from "./entities/interactive-type.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("interactives/interactive-types")

export class InteractiveTypesController {
  constructor(
    private readonly interactiveTypesService: InteractiveTypesService
  ) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegistereInteractiveType,
  })
  create(
    @Body() createInteractiveTypeDto: CreateInteractiveTypeDto,
    @Res() response: Response
  ) {
    return this.interactiveTypesService.create(
      createInteractiveTypeDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [InteractiveTypeEntity],
  })
  findAll(@Res() response: Response) {
    return this.interactiveTypesService.findAll(response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: InteractiveTypeEntity,
  })
  findOne(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.interactiveTypesService.findOne(id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateInteractiveType,
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInteractiveTypeDto: UpdateInteractiveTypeDto,
    @Res() response: Response
  ) {
    return this.interactiveTypesService.update(
      id,
      updateInteractiveTypeDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteInteractiveType,
  })
  remove(@Param("id", ParseIntPipe) id: number, @Res() response: Response) {
    return this.interactiveTypesService.remove(id, response);
  }
}
