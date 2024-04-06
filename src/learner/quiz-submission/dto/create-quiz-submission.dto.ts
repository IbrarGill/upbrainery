import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { contentQuestionOptions } from "src/constant/constant";

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class QuestionOption {
  @ApiProperty()
  @IsNumber()
  question_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  question_option_id: number;
}
export class CreateQuizSubmissionDto {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  is_graded: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  learner_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  course_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  content_session_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  interactive_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiProperty({ example: contentQuestionOptions })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => QuestionOption)
  questionOptions: QuestionOption[];
}

export class SearchQuizSubmission {
  @ApiPropertyOptional({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  @IsOptional()
  pageNo: number;
  @ApiPropertyOptional({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  learner_id: number;

  @ApiPropertyOptional({ description: "Content Session Id" })
  @IsOptional()
  @IsNumber()
  content_session_id: number;

  @ApiPropertyOptional({ description: "Course Id" })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiPropertyOptional({ description: "Interatactive Id" })
  @IsOptional()
  @IsNumber()
  interactive_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;
}

export class SearchQuizResult {
  @ApiPropertyOptional({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsOptional()
  @IsNumber()
  pageNo: number;
  
  @ApiPropertyOptional({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsOptional()
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ description: "Interactive Id" })
  @IsOptional()
  @IsNumber()
  interactive_id: number;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  learner_id: number;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  content_session_id: number;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  course_id: number;
}

export class SearchQuizes {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  @IsOptional()
  pageNo: number;

  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({ description: "Session Id" })
  @IsOptional()
  @IsNumber()
  session_id: number;

  @ApiPropertyOptional({ description: "Course Id" })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  learner_id: number;

  @ApiPropertyOptional({ description: "Instructor Id" })
  @IsOptional()
  @IsNumber()
  instructor_id: number;

  @ApiPropertyOptional({ description: "interactive Id" })
  @IsOptional()
  @IsNumber()
  interactive_id: number;
}

export class SearchQuizesAnswers {
  @ApiPropertyOptional({ description: "result_id" })
  @IsOptional()
  @IsNumber()
  result_id: number;

  @ApiPropertyOptional({ description: "Learner Id" })
  @IsOptional()
  @IsNumber()
  learner_id: number;

  @ApiPropertyOptional({ description: "Course Id" })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiPropertyOptional({ description: "Content Session Id" })
  @IsOptional()
  @IsNumber()
  content_session_id: number;
}
