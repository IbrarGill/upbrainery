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



export class CreateNewQuestionDto {
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

export class SearchNewQuestions {
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
    description: "Search NewQuestion by Text",
  })
  @IsOptional()
  @IsString()
  searchByText: string;

  @ApiProperty({ description: "Current UserId" })
  @IsOptional()
  @IsNotEmpty()
  instuctorId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional({ description: "Interactive Type Id", example: 1 })
  @IsOptional()
  @IsNumber()
  InteractiveTypeId: number;
}
