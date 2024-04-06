import { PartialType } from "@nestjs/mapped-types";
import { CreateStandardLevelDto } from "./create-standard_level.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UpdateStandardLevelDto extends PartialType(
  CreateStandardLevelDto
) {
  @ApiProperty({
    description: "Enter the name of the standardLevel to update.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the standarTypeId of the standarType to update.",
  })
  @IsNotEmpty()
  @IsNumber()
  standarTypeId: number;
}
