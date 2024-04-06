import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class CreateStandardTypeDto {
  @ApiProperty({
    description: "Enter the name of the Standard to create.",
  })
  @IsNotEmpty()
  @IsString()
  standardType: string;
}
