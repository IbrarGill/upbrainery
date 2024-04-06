import { PartialType } from "@nestjs/mapped-types";
import { CreateStandardSubjectDto } from "./create-standard_subject.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UpdateStandardSubjectDto extends PartialType(
  CreateStandardSubjectDto
) {
  @ApiProperty({
    description: "Enter the name of the Standard Subject to update.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the standardLevelId of the standard Level to update.",
  })
  @IsNotEmpty()
  @IsNumber()
  standardLevelId: number;
}
