import { PartialType } from "@nestjs/mapped-types";
import { CreateStandardDto } from "./create-standard.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UpdateStandardDto extends PartialType(CreateStandardDto) {
  @ApiProperty({
    description: "Enter the name of the standard to create.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the standard_type_id of the standard to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  standard_type_id: number;

  @ApiProperty({
    description: "Enter the standard_level_id of the standard to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  standard_level_id: number;

  @ApiProperty({
    description: "Enter the standard_subject_id of the standard to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  standard_subject_id: number;
}
