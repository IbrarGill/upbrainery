import { PartialType } from "@nestjs/mapped-types";
import { CreateTeachingStyleDto } from "./create-teaching_style.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class UpdateTeachingStyleDto extends PartialType(
  CreateTeachingStyleDto
) {
  @ApiProperty({
    description: "Enter the name of the techingStyle to update.",
  })
  @IsNotEmpty()
  @IsString()
  techingStyleName: string;
}
