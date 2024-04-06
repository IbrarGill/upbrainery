import { PartialType } from "@nestjs/mapped-types";
import { CreateQuestionDto } from "./create-question.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsTimeZone,
  IsArray,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
  IsOptional,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { UpdateOption, questionSkills } from "src/constant/constant";

class UpdateOptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_correct: boolean;

  @ApiProperty({ example: "string" })
  @IsBoolean()
  @IsNotEmpty()
  image_Name: string;
}

export class QuestionSkills {
  @ApiProperty()
  @IsNumber()
  skillId: number;
  @ApiProperty()
  @IsNumber()
  subskillId: number;
  @ApiProperty()
  @IsNumber()
  skillPoint: number;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiProperty({ example: "Question" })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  points: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  question_body: string;

  @ApiProperty({ example: 11 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  interactive_type_id: number;

  @ApiPropertyOptional({ example: UpdateOption })
  options: string;

  @ApiPropertyOptional({ example: questionSkills })
  questionSkill:string;

  @ApiPropertyOptional({
    type: "array",
    name: "questionAttachment",
    description: "User can upload Question Immages",
    items: { type: "string", format: "binary" },
  })
  questionAttachment: any;

  @ApiPropertyOptional({
    type: "array",
    name: "optionAttachment",
    description: "User can upload option Images",
    items: { type: "string", format: "binary" },
  })
  optionAttachment: any;
}
