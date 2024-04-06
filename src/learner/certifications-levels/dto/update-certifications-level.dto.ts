import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateCertificationsLevelDto } from "./create-certifications-level.dto";

export class UpdateCertificationsLevelDto extends PartialType(
  CreateCertificationsLevelDto
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
