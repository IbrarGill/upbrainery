import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class CreateTeachingStyleDto {
  @ApiProperty({
    description: "Enter the name of the techingStyle to create.",
  })
  @IsNotEmpty()
  @IsString()
  techingStyleName: string;
}
