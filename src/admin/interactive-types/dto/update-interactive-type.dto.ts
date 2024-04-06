import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateInteractiveTypeDto } from "./create-interactive-type.dto";

export class UpdateInteractiveTypeDto extends PartialType(
  CreateInteractiveTypeDto
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
