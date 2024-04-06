import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
} from "class-validator";
import { CreateInteractiveDto } from "./create-interactive.dto";

const subject = "[26,27,28]";

const question = "[1,2,3]";

export class UpdateInteractiveDto extends PartialType(CreateInteractiveDto) {
  @ApiProperty({ example: "title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  from_grade_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  to_grade_id: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  duration: number;

  @ApiProperty({ example: subject })
  @IsOptional()
  @IsString()
  subjects: string;

  @ApiPropertyOptional({ example: question })
  @IsOptional()
  @IsString()
  questions: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isdraft: boolean;

  @ApiPropertyOptional({
    type: "array",
    name: "interactiveAttachment",
    description: "User can upload video",
    items: { type: "string", format: "binary" },
  })
  interactiveAttachment: any;
}
