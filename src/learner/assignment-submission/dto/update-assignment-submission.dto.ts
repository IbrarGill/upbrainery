import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateAssignmentSubmissionDto } from "./create-assignment-submission.dto";

export class UpdateAssignmentSubmissionDto extends PartialType(
  CreateAssignmentSubmissionDto
) {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  marks: number;

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
  question_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  interactive_id: number;

  @ApiProperty({ example: "String" })
  @IsString()
  answer: string;
}
export class MarkAssignment {
  @ApiProperty({ example: 7 })
  @IsNotEmpty()
  @IsNumber()
  marks: number;
}
