import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateExpertyLevelDto {
  @ApiProperty({
    description: "Enter the name of the ExpertyLevel to create.",
  })
  @IsNotEmpty()
  @IsString()
  ExpertyLevelTitle: string;
}
