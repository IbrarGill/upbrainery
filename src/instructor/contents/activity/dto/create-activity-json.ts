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

const _attachment = {
    id: 1,
    filename: 'test.jpg',
    path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5MO3SyK-28kps5LYJKtO4QxUebEK728peBQ&usqp=CAU',
    attachment_types_id: 1,
    attachment_types_name: 'Image',
    imageKey: '8/1687264371063-333727957.jpg'
}

export const _contentBlockswithjosn = [
    {
        title: "title 1",
        is_instructor_only: true,
        description: "description 2",
        content_type_id: 1,
        instructor_id: 1,
        sequence_no: 1,
        blockattachment: [_attachment],
    },
    {
        title: "title 2",
        is_instructor_only: true,
        description: "description 2",
        content_type_id: 1,
        instructor_id: 1,
        sequence_no: 2,
        blockattachment: [_attachment],
    },
];

export const ResourceJson = [
    {
        is_viewable: true,
        is_downloadable: true,
        attachment: _attachment
    },
    {
        is_viewable: true,
        is_downloadable: true,
        attachment: _attachment
    },
];

export class AttachmentDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    id: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    filename: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    path: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    attachment_types_id: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    attachment_types_name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    imageKey: string
}

export class ContentSubjectJson {
    @ApiProperty()
    @IsNumber()
    subject_id: number;
    @ApiProperty()
    @IsNumber()
    subject_discipline_id: number;
}

export class ContentSkillsJson {
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

export class ContentVocabulariesJson {
    @ApiProperty()
    @IsString()
    vocabulary: string;
    @ApiProperty()
    @IsString()
    vocabulary_definition: string;
}


export class ContentBlocksJson {
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
    @Type(() => AttachmentDto)
    blockattachment: AttachmentDto[]
}

export class ContentActivityStandardJson {
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

export class ContentResourceJson {

    @ApiProperty()
    @IsBoolean()
    is_viewable: boolean;

    @ApiProperty()
    @IsBoolean()
    is_downloadable: boolean;

    @ApiProperty()
    @IsObject()
    attachment: AttachmentDto
}



export class CreateActivityJsonDto {
    @ApiProperty({ example: _attachment })
    @IsObject()
    @IsOptional()
    activityPhoto: AttachmentDto;

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
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => ContentSubjectJson)
    activitySubject: ContentSubjectJson[];

    @ApiProperty({ example: contentSkills })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => ContentSkillsJson)
    activitySkill: ContentSkillsJson[];

    @ApiPropertyOptional({ example: contentVocabularies })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => ContentVocabulariesJson)
    activityVocabulary: ContentVocabulariesJson[];

    @ApiPropertyOptional({ example: ActivityStandard })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => ContentActivityStandardJson)
    activityStandard: ContentActivityStandardJson[];

    @ApiPropertyOptional({ example: _contentBlockswithjosn })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => ContentBlocksJson)
    activityBlock: ContentBlocksJson[];

    @ApiPropertyOptional({ example: ResourceJson })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => ContentResourceJson)
    resource: ContentResourceJson[];
}


