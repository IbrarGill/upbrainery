import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NumberType } from "aws-sdk/clients/pinpointsmsvoicev2";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import {
  contentBlocks,
  contentQuestSegment,
  contentQuizSegment,
  contentAssignmentSegment,
  contentmodulesegmentactivities,
  courseBagdes,
} from "src/constant/constant";




export class ContentBlockAttachment {
  @ApiProperty()
  @IsString()
  filename: string;
}

export class ContentCourseBlocks {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsBoolean()
  is_instructor_only: boolean;
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty({
    example: 2,
  })
  @IsNumber()
  content_type_id: number;
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  instructor_id: number;

  @ApiProperty()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentBlockAttachment)
  blockattachment: ContentBlockAttachment[];
}

export class ContentInteractiveSegment {
  @ApiProperty()
  @IsNumber()
  interactive_id: number;
  @ApiProperty()
  @IsNumber()
  instructor_id: number;
}

export class activitiesList {
  @ApiProperty()
  @IsNumber()
  content_activity_id: number;
}

export class ContentModuleSegment {
  @ApiProperty()
  @IsString()
  module: string;
  @ApiProperty()
  @IsNumber()
  module_segment_type_id: number;
  @ApiProperty()
  @IsNumber()
  module_segment_delivery_id: number;
  @ApiProperty()
  @IsNumber()
  instructor_id: number;


  @ApiProperty()
  @IsArray()
  @IsOptional()
  @Type(() => activitiesList)
  activitiesList: activitiesList[];
}

export class CourseBagdes {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  badgesId: number;
}

export class CreateCourseDto {
  @ApiProperty({
    type: "array",
    name: "coursePhoto",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  coursePhoto: any;


  @ApiProperty({ example: 1 })
  @IsNumber()
  instructor_id: number;

  @ApiProperty({ example: "test course" })
  @IsString()
  courseName: string;

  @ApiProperty({ example: "course description" })
  @IsString()
  courseDescription: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  courseAvailabilityId: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  startAge: number;

  @ApiProperty({ example: 14 })
  @IsNumber()
  endAge: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  startGrade: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  isDraft: number;



  @ApiPropertyOptional({ example: courseBagdes })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => CourseBagdes)
  courseBagdes: CourseBagdes[];


  @ApiPropertyOptional({ example: contentQuestSegment })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentQuestSegment: ContentInteractiveSegment[];

  @ApiPropertyOptional({ example: contentQuizSegment })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentQuizSegment: ContentInteractiveSegment[];

  @ApiPropertyOptional({ example: contentAssignmentSegment })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentAssignmenttSegment: ContentInteractiveSegment[];

  @ApiProperty({ example: contentmodulesegmentactivities })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentModuleSegment)
  moduleSegment: ContentModuleSegment[];
}

enum orderByList {
  LatestCourse = "Latest Course",
  OldestCourse = "Oldest Course",
  SortByAZ = "Sort By A-Z",
  SortByZA = "Sort By Z-A",
}

export class CourseSubjectList {
  @ApiProperty()
  @IsNumber()
  subjectId: number;
}

enum StatusList {
  Active = "Active",
  Draft = "Draft",
}


export class SearchContentCourse {
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  instuctorId: number;

  @ApiPropertyOptional({ description: "AvailabilityType Id" })
  @IsOptional()
  @IsNumber()
  AvailabilityTypeId: number;

  @ApiPropertyOptional({ description: "start Grade" })
  @IsOptional()
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({ description: "end Grade" })
  @IsOptional()
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjects: string;

  @ApiPropertyOptional({
    example: "Active",
    enum: ["Active", "Draft"],
  })
  @IsOptional()
  @IsEnum(StatusList)
  status: StatusList;

  @ApiPropertyOptional({
    example: "Latest Course",
    enum: [
      "Latest Course",
      "Oldest Course",
      "Sort By A-Z",
      "Sort By Z-A",
    ],
  })
  @IsEnum(orderByList)
  orderBy: orderByList;


}

export class EnroleCourseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  learnerId: number;
}


export class learnerCourseQuery {
  @ApiProperty({
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
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({ description: "leaner Id" })
  @IsOptional()
  @IsNumber()
  learnerId: number;


  @ApiPropertyOptional({ description: "leaner Id" })
  @IsOptional()
  @IsNumber()
  subjectId: number;


  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({
    example: "Latest Course",
    enum: [
      "Latest Course",
      "Oldest Course",
      "Sort By A-Z",
      "Sort By Z-A",
    ],
  })
  @IsOptional()
  @IsEnum(orderByList)
  orderBy: orderByList;

  @ApiPropertyOptional({ description: 'Send Either 0 | 1' })
  @IsOptional()
  @IsNumber()
  quest: number
}



export class DuplicationCourseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  createrID: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  courseName: string;
}


export class CourseAssociatedSession {
  @ApiProperty({
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
  @IsOptional()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  course_id: number;
}