import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateStandardLevelDto {
  @ApiProperty({
    description: "Enter the name of the standardLevel to create.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the standarTypeId of the standarType to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  standarTypeId: number;
}
