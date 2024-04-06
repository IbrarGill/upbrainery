import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsTimeZone,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsEnum,
  isNotEmpty,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Interactive } from "../entities/interactive.entity";

enum orderByList {
  Latest = "Latest",
  Oldest = "Oldest",
}

const subject = "[26,27,28]";

const question = "[1,2,3]";

const interactiveIds = "[1,2,3,4]";
export class PublishInteractive {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  interative_id: number;
}

export class CreateInteractiveDto {
  @ApiProperty({ example: "title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  from_grade_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  to_grade_id: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  interactive_type_id: number;

  @ApiProperty({ example: 11 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isdraft: boolean;

  @ApiProperty({ example: subject })
  @IsOptional()
  @IsString()
  subjects: string;

  @ApiPropertyOptional({ example: question })
  @IsOptional()
  @IsString()
  questions: string;

  @ApiPropertyOptional({
    type: "array",
    name: "interactiveAttachment",
    description: "User can upload video",
    items: { type: "string", format: "binary" },
  })
  interactiveAttachment: any;
}

export class FindInteractiveByArray {
  @ApiProperty({ example: interactiveIds })
  @IsNumber({}, { each: true })
  interactive_id_array: number[];
}

export class FindLearnerInteractive {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  learner_id: number;
}

export class SearchInteractive {
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

  @ApiPropertyOptional({ description: "start Grade" })
  @IsOptional()
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({ description: "end Grade" })
  @IsOptional()
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ description: "Subject ID" })
  @IsOptional()
  @IsNumber()
  subjectsId: number;

  @ApiPropertyOptional({
    description: "published/unpublished",
  })
  @IsOptional()
  @IsString()
  isDraft: string;

  @ApiPropertyOptional({
    description: "Search Interactive by Text",
  })
  @IsOptional()
  @IsString()
  searchByText: string;

  @ApiPropertyOptional({
    example: "Latest",
    enum: ["Latest", "Oldest"],
  })
  @IsEnum(orderByList)
  orderBy: orderByList;
}
export class DuplicateInteractive {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  instuctor_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  interactive_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interactive_name: string;


}

export class interactiveSubjectQuery{

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  instuctor_id: number;


}
export class VideoUploadDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  interactive_id: string;

  @ApiProperty({
    type: "array",
    name: "interactiveAttachment",
    description: "User can upload video",
    items: { type: "string", format: "binary" },
  })
  interactiveAttachment: any;
}
