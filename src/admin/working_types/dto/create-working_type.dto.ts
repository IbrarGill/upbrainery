import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class CreateWorkingTypeDto {
  @ApiProperty({
    description: "Enter the name of the WorkingType to create.",
  })
  @IsNotEmpty()
  @IsString()
  workingType: string;
}
