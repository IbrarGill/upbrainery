import { PartialType } from "@nestjs/mapped-types";
import { CreateNewQuestionDto } from "./create-new-question.dto";
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
import { Type } from "class-transformer";
import { CreateNewOption, QuestAttachment } from "src/constant/constant";

export class NewQuestionAttachmentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  attachment_type_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  Image_key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  field_name: string;
}

export class CreateOptionDto {
  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsBoolean()
  is_correct: boolean;
  
  @ApiProperty({ example: QuestAttachment })
  @ValidateNested({ each: true, always: true })
  @Type(() => NewQuestionAttachmentDto)
  questionAttachment: NewQuestionAttachmentDto;
}

export class UpdateNewQuestionDto extends PartialType(CreateNewQuestionDto) {
  @ApiProperty({ example: "NewQuestion" })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  points: number;

  @ApiPropertyOptional({ example: "NewQuestion Body" })
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

  @ApiProperty({ example: QuestAttachment })
  @ValidateNested({ each: true, always: true })
  @Type(() => NewQuestionAttachmentDto)
  questionAttachment: NewQuestionAttachmentDto;


  @ApiProperty({ example: CreateNewOption })
  @ValidateNested({ each: true, always: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}