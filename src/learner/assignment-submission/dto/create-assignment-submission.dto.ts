import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAssignmentSubmissionDto {
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
  question_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  interactive_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiProperty({ example: "String" })
  @IsString()
  answer: string;
}

export class SearchAssignmentSubmission {
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

  @ApiPropertyOptional({ description: "Session Id" })
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


enum orderByAsignment {
  LatestAssignments = "Latest Assignments",
  OldestAssignments = "Oldest Assignments",
}
export class SearchAssignment {

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  from_grade_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  to_grade_id: number;

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

  @ApiPropertyOptional({
    example: "Latest Assignments",
    enum: [
      "Latest Assignments",
      "Oldest Assignments",
    ],
  })
  @IsOptional()
  @IsEnum(orderByAsignment)
  orderBy: orderByAsignment;
}
