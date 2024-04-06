import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateExpertyLevelDto } from "./create-experty_level.dto";

export class UpdateExpertyLevelDto extends PartialType(CreateExpertyLevelDto) {
  @ApiProperty({
    description: "Enter the name of the ExpertyLevel to create.",
  })
  @IsNotEmpty()
  @IsString()
  ExpertyLevelTitle: string;
}
