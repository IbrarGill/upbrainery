import { PartialType } from '@nestjs/mapped-types';
import { ContentActivityStandard, ContentBlockAttachment, ContentBlocks, ContentResource, ContentSkills, ContentSubject, ContentVocabularies, CreateActivityDto } from './create-activity.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested, IsArray, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ContentSubjectDiscipline, contentSkills, contentVocabularies, ActivityStandard, contentBlocks, Resource } from 'src/constant/constant';
import { AttachmentDto } from './create-activity-json';

export const contentBlocksupdatepayload = [
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

export class ContentBlockAttachmentDeteteDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
export class ContentBlocksUpdateJsonDto {
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
  @ApiPropertyOptional()1
  @IsString()
  content_type_id: string;
  @ApiPropertyOptional()
  @IsString()
  instructor_id: string;

  @ApiProperty()
  @IsNumber()
  sequence_no: number;

  @ApiPropertyOptional()
  @IsBoolean()
  isblockdeleted: boolean;

  @ApiPropertyOptional()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ContentBlockAttachmentDeteteDto)
  deleteAttachments: ContentBlockAttachmentDeteteDto[]

  @ApiProperty()
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => AttachmentDto)
  blockattachment: AttachmentDto[]
}

const _attachment = {
  filename: 'test.jpg',
  path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5MO3SyK-28kps5LYJKtO4QxUebEK728peBQ&usqp=CAU',
  attachment_types_id: 1,
  attachment_types_name: 'Image',
  imageKey: '8/1687264371063-333727957.jpg'
}
export class ContentResourceUpdateJsonDto {
  @ApiProperty()
  id: number | null

  @ApiProperty()
  @IsString()
  filename: string

  @ApiProperty()
  @IsBoolean()
  is_viewable: boolean;

  @ApiProperty()
  @IsBoolean()
  is_downloadable: boolean;

  @ApiProperty()
  @IsBoolean()
  isdeleted: boolean

  @ApiProperty({ example: _attachment })
  @IsObject()
  @IsOptional()
  attachment: AttachmentDto;

}

export const ResourceUpdatePayload = [
  {
    id: 1,
    filename: "1.jpg",
    is_viewable: false,
    is_downloadable: false,
    isdeleted: false
  },
  {
    id: 2,
    filename: "2.jpg",
    is_viewable: true,
    is_downloadable: false,
    isdeleted: false
  },
];


export class UpdateActivityJsonDto  {


  @ApiPropertyOptional({
    type: "array",
    name: "activityPhoto",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  activityPhoto: any;


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

  @ApiPropertyOptional({
    type: "array",
    name: "blockImage",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  blockImage: any;


  @ApiPropertyOptional({
    type: "array",
    name: "ActivityResource",
    description: "user can upload his Activity Resource",
    items: { type: "string", format: "binary" },
  })
  ActivityResource: any



  @ApiPropertyOptional({ example: "testActivity" })
  @IsString()
  @IsOptional()
  activityName: string;

  @ApiPropertyOptional({ example: "test description" })
  @IsString()
  @IsOptional()
  activityDescription: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  activityAvailabilityId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  activityWorkTypeId: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  durations: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  startAge: number;

  @ApiPropertyOptional({ example: 14 })
  @IsNumber()
  @IsOptional()
  endAge: number;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  @IsOptional()
  startGrade: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  endGrade: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  isDraft: number;

  @ApiPropertyOptional({ example: ContentSubjectDiscipline })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentSubject)
  activitySubject: ContentSubject[];

  @ApiPropertyOptional({ example: contentSkills })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentSkills)
  activitySkill: ContentSkills[];

  @ApiPropertyOptional({ example: contentVocabularies })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentVocabularies)
  activityVocabulary: ContentVocabularies[];

  @ApiPropertyOptional({ example: ActivityStandard })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentActivityStandard)
  activityStandard: ContentActivityStandard[];

  @ApiPropertyOptional({ example: contentBlocksupdatepayload })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentBlocksUpdateJsonDto)
  activityBlock: ContentBlocksUpdateJsonDto[];


  @ApiPropertyOptional({ example: ResourceUpdatePayload })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => ContentResourceUpdateJsonDto)
  resource: ContentResourceUpdateJsonDto[];

}
