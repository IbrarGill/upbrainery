import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateStandardSubjectDto {
  @ApiProperty({
    description: "Enter the name of the Standard Subject to create.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the standardLevelId of the standard Level to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  standardLevelId: number;
}
