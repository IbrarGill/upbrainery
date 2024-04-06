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
  UseGuards,
} from "@nestjs/common";
import { ModuleSegmentTypesService } from "./module_segment_types.service";
import { CreateModuleSegmentTypeDto } from "./dto/create-module_segment_type.dto";
import { UpdateModuleSegmentTypeDto } from "./dto/update-module_segment_type.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  DeleteModuleSegmentTypeEntity,
  ModuleSegmentTypeEntity,
  RegisteredModuleSegmentTypeEntity,
  UpdateModuleSegmentTypeEntity,
} from "./entities/module_segment_type.entity";
import { JwtGuard } from "src/authStrategy/guard";

@ApiTags("/admin/module-segment-type")
@Controller("")

export class ModuleSegmentTypesController {
  constructor(
    private readonly moduleSegmentTypesService: ModuleSegmentTypesService
  ) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredModuleSegmentTypeEntity,
  })
  create(
    @Body() createModuleSegmentTypeDto: CreateModuleSegmentTypeDto,
    @Res() response: Response
  ) {
    return this.moduleSegmentTypesService.create(
      createModuleSegmentTypeDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ModuleSegmentTypeEntity],
  })
  findAll(@Res() response: Response) {
    return this.moduleSegmentTypesService.findAll(response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: ModuleSegmentTypeEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.moduleSegmentTypesService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateModuleSegmentTypeEntity,
  })
  update(
    @Param("id") id: string,
    @Body() updateModuleSegmentTypeDto: UpdateModuleSegmentTypeDto,
    @Res() response: Response
  ) {
    return this.moduleSegmentTypesService.update(
      +id,
      updateModuleSegmentTypeDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteModuleSegmentTypeEntity,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.moduleSegmentTypesService.remove(+id, response);
  }
}
