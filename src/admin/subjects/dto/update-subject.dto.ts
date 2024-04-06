import { PartialType } from "@nestjs/mapped-types";
import { CreateSubjectDto } from "./create-subject.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
