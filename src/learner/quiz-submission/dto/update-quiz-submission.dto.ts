import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { CreateQuizSubmissionDto } from "./create-quiz-submission.dto";
import { updateQuestionOptions } from "src/constant/constant";
import { Type } from "class-transformer";

export class QuestionOption {


  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  question_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  question_option_id: number;
}

export class UpdateQuizSubmissionDto {
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

  @ApiProperty({ example: updateQuestionOptions })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => QuestionOption)
  questionOptions: QuestionOption[];
}
