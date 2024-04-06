import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateModuleSegmentDeliveryDto } from "./create-module_segment_delivery.dto";

export class UpdateModuleSegmentDeliveryDto extends PartialType(
  CreateModuleSegmentDeliveryDto
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
