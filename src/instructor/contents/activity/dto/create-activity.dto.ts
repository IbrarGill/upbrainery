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
  IsObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from "class-validator";

import {
  ActivityStandard,
  contentBlocks,
  contentSkills,
  ContentSubjectDiscipline,
  contentVocabularies,
  Resource,
} from "src/constant/constant";

export class ContentSubject {
  @ApiProperty()
  @IsNumber()
  subject_id: number;
  @ApiProperty()
  @IsNumber()
  subject_discipline_id: number;
}

export class ContentSkills {
  @ApiProperty()
  @IsNumber()
  skill_id: number;
  @ApiProperty()
  @IsNumber()
  sub_skill_id: number;
  @ApiProperty()
  @IsNumber()
  skill_points: number;
}

export class ContentVocabularies {
  @ApiProperty()
  @IsString()
  vocabulary: string;
  @ApiProperty()
  @IsString()
  vocabulary_definition: string;
}

export class ContentBlockAttachment {
  @ApiProperty()
  @IsString()
  filename: string;
}

export class ContentBlocks {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsBoolean()
  is_instructor_only: boolean;
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsString()
  content_type_id: string;
  @ApiProperty()
  @IsString()
  instructor_id: string;

  @ApiProperty()
  @IsNumber()
  sequence_no: number;

  @ApiProperty()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentBlockAttachment)
  blockattachment: ContentBlockAttachment[]
}

export class ContentActivityStandard {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsNumber()
  standard_type_id: number;
  @ApiProperty()
  @IsNumber()
  standard_level_id: number;
  @ApiProperty()
  @IsNumber()
  standard_subject_id: number;
}

export class ContentResource {
  @ApiProperty()
  @IsString()
  filename: string

  @ApiProperty()
  @IsBoolean()
  is_viewable: boolean;

  @ApiProperty()
  @IsBoolean()
  is_downloadable: boolean;
}

export class CreateActivityDto {
  @ApiProperty({
    type: "array",
    name: "activityPhoto",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  activityPhoto: any;

  @ApiProperty({
    type: "array",
    name: "blockImage",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  blockImage: any;

  @ApiProperty({
    type: "array",
    name: "blockVideo",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  blockVideo: any;

  @ApiProperty({
    type: "array",
    name: "Model3D",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  Model3D: any

  @ApiProperty({
    type: "array",
    name: "ActivityResource",
    description: "user can upload his Activity Resource",
    items: { type: "string", format: "binary" },
  })
  ActivityResource: any

  @ApiProperty({ example: 1 })
  @IsNumber()
  instructor_id: number;

  @ApiProperty({ example: "testActivity" })
  @IsString()
  activityName: string;

  @ApiProperty({ example: "test description" })
  @IsString()
  activityDescription: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  activityAvailabilityId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  activityWorkTypeId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  durations: number;

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

  @ApiProperty({ example: ContentSubjectDiscipline })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentSubject)
  activitySubject: ContentSubject[];

  @ApiProperty({ example: contentSkills })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentSkills)
  activitySkill: ContentSkills[];

  @ApiPropertyOptional({ example: contentVocabularies })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentVocabularies)
  activityVocabulary: ContentVocabularies[];

  @ApiPropertyOptional({ example: ActivityStandard })
  @Transform(({ value }) => { if (value) return JSON.parse(value) })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentActivityStandard)
  activityStandard: ContentActivityStandard[];

  @ApiPropertyOptional({ example: contentBlocks })
  @Transform(({ value }) => { if (value) return JSON.parse(value) })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentBlocks)
  activityBlock: ContentBlocks[];

  @ApiPropertyOptional({ example: Resource })
  @Transform(({ value }) => { if (value) return JSON.parse(value) })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentResource)
  resource: ContentResource[];
}

enum orderByList {
  LatestActivities = "Latest Activities",
  OldestActivities = "Oldest Activities",
  SortByAZ = "Sort By A-Z",
  SortByZA = "Sort By Z-A",
}

enum StatusList {
  Active = "Active",
  Draft = "Draft",
}

export class SearchContentActivity {
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
  searchByText: string

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  instuctorId: number;

  @ApiPropertyOptional({ description: "Availability Type Id", example: 1 })
  @IsOptional()
  @IsNumber()
  AvailabilityTypeId: number;

  @ApiPropertyOptional({ description: "Start Age" })
  @IsOptional()
  @IsNumber()
  startAge: number;

  @ApiPropertyOptional({ description: "End Age" })
  @IsOptional()
  @IsNumber()
  endAge: number;

  @ApiPropertyOptional({ description: "start Grade" })
  @IsOptional()
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({ description: "end Grade" })
  @IsOptional()
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ description: "Subject ID", example: [1, 2] })
  @IsOptional()
  @IsString()
  subjects: string;

  @ApiPropertyOptional({ description: "Skill ID", example: [1, 2] })
  @IsOptional()
  @IsString()
  skills: string;

  @ApiPropertyOptional({ description: "Duration" })
  @IsOptional()
  @IsNumber()
  duration: number;

  @ApiPropertyOptional({
    example: "Latest Activities",
    enum: [
      "Latest Activities",
      "Oldest Activities",
      "Sort By A-Z",
      "Sort By Z-A",
    ],
  })
  @IsOptional()
  @IsEnum(orderByList)
  orderBy: orderByList;

  @ApiPropertyOptional({
    example: "Active",
    enum: ["Active", "Draft"],
  })
  @IsOptional()
  @IsEnum(StatusList)
  status: StatusList;
}


const ActivitiesListIds = [1, 2];

export class FindActivityByArrayofIds {
  @ApiProperty({ example: ActivitiesListIds })
  @IsNumber({}, { each: true })
  Activity_ids: number[];
}


export class ActivityDuplicationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ActivityId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  createrID: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activityName: string;
}