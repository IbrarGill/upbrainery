import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateExpierenceDto } from "./create-expierence.dto";

export class UpdateExpierenceDto extends PartialType(CreateExpierenceDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
