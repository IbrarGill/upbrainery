import { PartialType } from '@nestjs/mapped-types';
import { ContentBlockAttachment, ContentCourseBlocks, ContentInteractiveSegment, ContentModuleSegment, CreateCourseDto, activitiesList } from './create-course.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  contentBlocks,
  contentQuestSegment,
  contentQuizSegment,
  contentAssignmentSegment, contentmodulesegmentactivities
} from 'src/constant/constant';

export const contentBlocksCourseupdatepayload = [
  {
    id: 1,
    title: "title updated",
    is_instructor_only: false,
    description: "description",
    content_type_id: 1,
    instructor_id: 1,
    isblockdeleted: true,
    deleteAttachments: [3, 4],
    blockattachment: [],
  },
  {
    id: 2,
    title: "title 1 updated",
    is_instructor_only: true,
    description: "description",
    content_type_id: 1,
    instructor_id: 1,
    isblockdeleted: false,
    deleteAttachments: [],
    blockattachment: [],
  },

];

export const contentmodulesegmentactivitiesUpdate = [
  {
    content_module_segment_id: 1,
    module: "modules 1",
    instructor_id: 6,
    module_segment_type_id: 1,
    module_segment_delivery_id: 1,
    isDeleted: false,
    activitiesList: [
      {
        content_activity_id: 144,
        isDeleted: false,
      }
    ],

  },
  {
    content_module_segment_id: 1,
    module: "modules 2",
    instructor_id: 6,
    isDeleted: false,
    module_segment_type_id: 1,
    module_segment_delivery_id: 1,
    activitiesList: [
      {
        content_activity_id: 145,
        isDeleted: false,
      }
    ],
  },
];

export class ContentBlockCourseAttachmentDeteteDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
export class ContentBlocksCourseUpdateDto {
  @ApiPropertyOptional()
  @IsNumber()
  id: number | null

  @ApiPropertyOptional()
  @IsString()
  title: string;
  @ApiPropertyOptional()
  @IsBoolean()
  is_instructor_only: boolean;
  @ApiPropertyOptional()
  @IsString()
  description: string;
  @ApiPropertyOptional()
  @IsString()
  content_type_id: string;
  @ApiPropertyOptional()
  @IsString()
  instructor_id: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isblockdeleted: boolean;

  @ApiPropertyOptional()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentBlockCourseAttachmentDeteteDto)
  deleteAttachments: ContentBlockCourseAttachmentDeteteDto[]

  @ApiPropertyOptional()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentBlockAttachment)
  blockattachment: ContentBlockAttachment[]
}

export class activitiesUpdatedList {
  @ApiProperty()
  @IsNumber()
  content_activity_id: number;
  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean
}
export class ContentModuleSegmentUpdateDto {
  @ApiProperty()
  @IsNumber()
  content_module_segment_id: number | null

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
  @IsBoolean()
  isDeleted: boolean
  @ApiProperty()
  @IsArray()
  @IsOptional()
  @Type(() => activitiesUpdatedList)
  activitiesList: activitiesUpdatedList[];
}

export class CourseBagdesUpdateDto {
  @ApiProperty()
  @IsOptional()
  id: number | null

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  badgesId: number;

  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean
}

export const courseBagdesUpdateDtoPayload = [
  {
    id: 1,
    badgesId: 53,
    isDeleted: false,
  },
  {
    id: null,
    badgesId: 51,
    isDeleted: true,
  },
];

export class UpdateCourseDto {

  @ApiProperty({
    type: "array",
    name: "coursePhoto",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  coursePhoto: any;

  // @ApiProperty({
  //   type: "array",
  //   name: "blockImage",
  //   description: "user can upload his block attachments",
  //   items: { type: "string", format: "binary" },
  // })
  // blockImage: any;

  // @ApiProperty({
  //   type: "array",
  //   name: "blockVideo",
  //   description: "user can upload his profile picture",
  //   items: { type: "string", format: "binary" },
  // })
  // blockVideo: any;

  // @ApiProperty({
  //   type: "array",
  //   name: "Model3D",
  //   description: "user can upload his profile picture",
  //   items: { type: "string", format: "binary" },
  // })
  // Model3D: any


  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  instructor_id: number;

  @ApiPropertyOptional({ example: "test course" })
  @IsString()
  courseName: string;

  @ApiPropertyOptional({ example: "course description" })
  @IsString()
  courseDescription: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  courseAvailabilityId: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  startAge: number;

  @ApiPropertyOptional({ example: 14 })
  @IsNumber()
  endAge: number;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  isDraft: number;

  @ApiPropertyOptional({ example: courseBagdesUpdateDtoPayload })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => CourseBagdesUpdateDto)
  coursebadges: CourseBagdesUpdateDto[];

  // @ApiPropertyOptional({ example: contentBlocksCourseupdatepayload })
  // @Transform(({ value }) => {
  //   if (value) return JSON.parse(value);
  // })
  // @ValidateNested({ each: true, always: true })
  // @IsArray()
  // @IsOptional()
  // @Type(() => ContentBlocksCourseUpdateDto)
  // courseBlock: ContentBlocksCourseUpdateDto[];

  @ApiPropertyOptional({ example: contentQuestSegment })
  @ValidateNested({ each: true, always: true })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentQuestSegment: ContentInteractiveSegment[];

  @ApiPropertyOptional({ example: contentQuizSegment })
  @ValidateNested({ each: true, always: true })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentQuizSegment: ContentInteractiveSegment[];

  @ApiPropertyOptional({ example: contentAssignmentSegment })
  @ValidateNested({ each: true, always: true })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @IsArray()
  @IsOptional()
  @Type(() => ContentInteractiveSegment)
  contentAssignmenttSegment: ContentInteractiveSegment[];

  @ApiPropertyOptional({ example: contentmodulesegmentactivitiesUpdate })
  @ValidateNested({ each: true, always: true })
  @Transform(({ value }) => {
    if (value) return JSON.parse(value);
  })
  @IsArray()
  @IsOptional()
  @Type(() => ContentModuleSegmentUpdateDto)
  moduleSegment: ContentModuleSegmentUpdateDto[];

}
