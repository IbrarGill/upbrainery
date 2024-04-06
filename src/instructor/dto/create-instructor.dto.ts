import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { number } from "joi";

export class CreateInstructorDto { }


enum orderByList {
    ASCName = "ASC Name",
    DESCName = "DESC Name",
    ASCPrice = "ASC Price",
    DESCPrice = "DESC Price",
}

export class GradeList {
    @ApiProperty()
    @IsNumber()
    gradeId: number
}

export class SubjectList {
    @ApiProperty()
    @IsNumber()
    subjectId: number
}

export class experienceList {
    @ApiProperty()
    @IsNumber()
    experienceId: number
}

export class LearningStats {
    @ApiProperty()
    @IsString()
    stat: string
}

export const _gradelist = [
    { "gradeId": 1 },
    { "gradeId": 2 }
];

export const _subjectlist = [
    { "subjectId": 1 },
    { "subjectId": 2 }
];

export const _experiencelist = [
    { "experienceId": 1 },
    { "experienceId": 2 }
];


export const _learnerstat = [
    'Direct Instruction',
    'Question and Answer'
];


export class SearchInstuctorQuery {
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

    @ApiPropertyOptional({ example: _gradelist })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => GradeList)
    grades: GradeList[];


    @ApiPropertyOptional({ example: _subjectlist })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => GradeList)
    subjects: GradeList[];

    @ApiPropertyOptional({ example: _experiencelist })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => SubjectList)
    expierence: SubjectList[];




    @ApiPropertyOptional({ example: _learnerstat })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @IsArray()
    @IsOptional()
    @Type(() => SubjectList)
    learningStats: SubjectList[];


    @ApiPropertyOptional({
        example: "Sort By Title ASC",
        enum: [
            "ASC Name",
            "DESC Name",
            "ASC Price",
            "DESC Price",
        ],
    })
    @IsOptional()
    @IsEnum(orderByList)
    orderBy: orderByList;
}


enum DashboardFilter {
    LatestLearner = "Latest Learner",
    OldestLearner = "Oldest Learner",
}


export class InstructorDashbaordQuery {

    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiProperty({
        required: true,
        default: 9,
        description: "limit number",
    })
    @IsNumber()
    limit: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchbytext: string

    @ApiProperty()
    instructorId: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    courseId: number;

    @ApiPropertyOptional({ example: '1-5' })
    @IsOptional()
    @IsString()
    grades: string

    @ApiPropertyOptional({
        example: "Latest Learner",
        enum: [
            "Latest Learner",
            "Oldest Learner",
        ],
    })
    @IsOptional()
    @IsEnum(DashboardFilter)
    orderBy: DashboardFilter;
}


export class InstructorAllLearnerQuery {

    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiPropertyOptional({
        required: true,
        default: 9,
        description: "limit number",
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiProperty()
    instructorId: number

    @ApiPropertyOptional({
        example: "Latest Learner",
        enum: [
            "Latest Learner",
            "Oldest Learner",
        ],
    })
    @IsOptional()
    @IsEnum(DashboardFilter)
    orderBy: DashboardFilter;
}

enum DashboardSessionFilter {
    LatestSession = "Latest Session",
    OldestSession = "Oldest Session",
}

export class InstructorAllSessionQuery {

    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiPropertyOptional({
        required: true,
        default: 9,
        description: "limit number",
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    searchbytext: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    courseId: number;

    @ApiPropertyOptional({ example: '1-5' })
    @IsOptional()
    @IsString()
    grades: string

    @ApiProperty()
    instructorId: number

    @ApiPropertyOptional({
        example: "Latest Session",
        enum: [
            "Latest Session",
            "Oldest Session",
        ],
    })
    @IsOptional()
    @IsEnum(DashboardSessionFilter)
    orderBy: DashboardSessionFilter;
}


