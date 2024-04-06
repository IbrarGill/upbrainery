import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
  ValidationTypes,
} from "class-validator";
import { type } from "os";
import { CreateOption, questionSkills } from "src/constant/constant";

export class CreateOptionDto {
  @ApiProperty()
  @IsString()
  answer: string;
  @ApiProperty()
  @IsBoolean()
  is_correct: boolean;
  @ApiProperty()
  @IsString()
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

export class CreateQuestionDto {
  @ApiProperty({ example: "Question" })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  points: number;

  @ApiPropertyOptional({ example: "Question Body" })
  @IsString()
  @IsNotEmpty()
  question_body: string;

  @ApiProperty({ example: 11 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  interactive_type_id: number;

  @ApiPropertyOptional({ example: CreateOption })
  @IsOptional()
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

export class SearchQuestions {
  @ApiPropertyOptional({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiPropertyOptional({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({
    description: "Search Question by Text",
  })
  @IsOptional()
  @IsString()
  searchByText: string;

  @ApiProperty({ description: "Current UserId" })
  @IsOptional()
  @IsNotEmpty()
  instuctorId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsOptional()
  private_to_instructor: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional({ description: "Interactive Type Id", example: 1 })
  @IsOptional()
  @IsNumber()
  InteractiveTypeId: number;
}
