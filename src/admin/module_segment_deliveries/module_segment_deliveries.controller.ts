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
import { ModuleSegmentDeliveriesService } from "./module_segment_deliveries.service";
import { CreateModuleSegmentDeliveryDto } from "./dto/create-module_segment_delivery.dto";
import { UpdateModuleSegmentDeliveryDto } from "./dto/update-module_segment_delivery.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  DeleteModuleSegmentDelivery,
  ModuleSegmentDeliveryEntity,
  RegisteredModuleSegmentDelivery,
  UpdateModuleSegmentDelivery,
} from "./entities/module_segment_delivery.entity";
import { JwtGuard } from "src/authStrategy/guard";
@ApiTags("/admin/module-segment-delivery")
@Controller("")

export class ModuleSegmentDeliveriesController {
  constructor(
    private readonly moduleSegmentDeliveriesService: ModuleSegmentDeliveriesService
  ) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisteredModuleSegmentDelivery,
  })
  create(
    @Body() createModuleSegmentDeliveryDto: CreateModuleSegmentDeliveryDto,
    @Res() response: Response
  ) {
    return this.moduleSegmentDeliveriesService.create(
      createModuleSegmentDeliveryDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ModuleSegmentDeliveryEntity],
  })
  findAll(@Res() response: Response) {
    return this.moduleSegmentDeliveriesService.findAll(response);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: ModuleSegmentDeliveryEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.moduleSegmentDeliveriesService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateModuleSegmentDelivery,
  })
  update(
    @Param("id") id: string,
    @Body() updateModuleSegmentDeliveryDto: UpdateModuleSegmentDeliveryDto,
    @Res() response: Response
  ) {
    return this.moduleSegmentDeliveriesService.update(
      +id,
      updateModuleSegmentDeliveryDto,
      response
    );
  }

  @Delete(":id")
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteModuleSegmentDelivery,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.moduleSegmentDeliveriesService.remove(+id, response);
  }
}
