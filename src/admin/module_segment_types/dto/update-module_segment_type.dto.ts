import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateModuleSegmentTypeDto } from "./create-module_segment_type.dto";

export class UpdateModuleSegmentTypeDto extends PartialType(
  CreateModuleSegmentTypeDto
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
