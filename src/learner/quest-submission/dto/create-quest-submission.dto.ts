import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuestAttachment } from "src/constant/constant";

export class CreateQuestSubmissionDto {
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
  content_session_id: number;

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
  video_description: string;

  @ApiProperty({
    type: "array",
    name: "questAttachment",
    description: "User can upload attachment",
    items: { type: "string", format: "binary" },
  })
  questAttachment: any;
}

export class QuestAttachmentDto {
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


export class CreateNewQuestSubmissionDto {
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
  content_session_id: number;

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
  video_description: string;

  @ApiProperty({ example: QuestAttachment })
  @ValidateNested({ each: true, always: true })
  @Type(() => QuestAttachmentDto)
  attachment: QuestAttachmentDto;
}

export class SearchQuestSubmission {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
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

enum orderByQuest {
  LatestQuests = "Latest Quests",
  OldestQuests = "Oldest Quests",
}

export class SearchQuest {
  
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
    example: "Latest Quests",
    enum: [
      "Latest Quests",
      "Oldest Quests",
    ],
  })
  @IsOptional()
  @IsEnum(orderByQuest)
  orderBy: orderByQuest;
}

export class MarkQuest {
  @ApiProperty({ example: 7 })
  @IsNotEmpty()
  @IsNumber()
  marks: number;
}
