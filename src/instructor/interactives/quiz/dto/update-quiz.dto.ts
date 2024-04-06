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
import { CreateQuizDto } from "./create-quiz.dto";

const subject = [26,27,28];

const question = [1,2,3];

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
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
  @IsArray()
  subjects: string[];

  @ApiPropertyOptional({ example: question })
  @IsOptional()
  @IsArray()
  questions: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isdraft: boolean;

}
