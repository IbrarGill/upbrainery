import { PartialType } from "@nestjs/mapped-types";
import { CreateGradeDto } from "./create-grade.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
