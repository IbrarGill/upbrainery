import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateQuestSubmissionDto } from "./create-quest-submission.dto";

export class UpdateQuestSubmissionDto extends PartialType(
  CreateQuestSubmissionDto
) {
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

  @ApiProperty({ example: "String" })
  @IsString()
  video_description: string;
}
