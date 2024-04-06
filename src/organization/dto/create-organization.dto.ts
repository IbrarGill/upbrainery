import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrganizationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    organizationName: string

    @ApiProperty()
    @IsOptional()
    pid: number | null

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_name: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    contact_no: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    organization_type_id: number
}


export class Graph1QueryDto {
    @ApiProperty()
    @IsOptional()
    organizationId: number

    @ApiPropertyOptional()
    @IsOptional()
    accountTypeId: number

    @ApiProperty()
    @IsOptional()
    startDate: Date

    @ApiProperty()
    @IsOptional()
    endDate: Date

    @ApiPropertyOptional({ example: '1-12' })
    @IsString()
    @IsOptional()
    grade: string
}


export class Graph2QueryDto {
    @ApiProperty()
    @IsOptional()
    organizationId: number

    @ApiPropertyOptional({ example: '1-12' })
    @IsString()
    @IsOptional()
    grade: string
}

enum DashboardInstructorAllFilter {
    LatestInstructor = "Latest Instructor",
    OldestInstructor = "Oldest Instructor",
}

enum DashboardLearnerAllFilter {
    LatestLearner = "Latest Learner",
    OldestLearner = "Oldest Learner",
}

enum StatusFilter {
    Active = "Active",
    InActive = "InActive",
}

export class SearchOrganazitionInstuctorQuery {
    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiPropertyOptional({
        required: true,
        default: 15,
        description: "limit number",
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchbytext: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subjectList: string


    @ApiPropertyOptional()
    @IsNumber()
    @IsNotEmpty()
    organizationId: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    instituteId: number

    @ApiPropertyOptional({
        example: "Active",
        enum: [
            "Active",
            "InActive",
        ],
    })
    @IsOptional()
    @IsEnum(StatusFilter)
    status: StatusFilter;


    @ApiPropertyOptional({
        example: "Latest Instructor",
        enum: [
            "Latest Instructor",
            "Oldest Instructor",
        ],
    })
    @IsOptional()
    @IsEnum(DashboardInstructorAllFilter)
    orderBy: DashboardInstructorAllFilter;
}


export class SearchOrganazitionLearnerQuery {
    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiPropertyOptional({
        required: true,
        default: 15,
        description: "limit number",
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchbytext: string

    @ApiPropertyOptional()
    @IsNumber()
    @IsNotEmpty()
    organizationId: number

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    instituteId: number

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    instructorId: number

    @ApiPropertyOptional({ example: '1-3' })
    @IsString()
    @IsOptional()
    grade: string

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    IsPDSession: number

    @ApiPropertyOptional({
        example: "Latest Learner",
        enum: [
            "Latest Learner",
            "Oldest Learner",
        ],
    })
    @IsOptional()
    @IsEnum(DashboardLearnerAllFilter)
    orderBy: DashboardLearnerAllFilter;

    @ApiPropertyOptional({
        example: "Active",
        enum: [
            "Active",
            "InActive",
        ],
    })
    @IsOptional()
    @IsEnum(StatusFilter)
    status: StatusFilter;

}


export class SearchOrganazitionInstituteQuery {
    @ApiProperty({
        required: true,
        default: 0,
        description: "Page number",
    })
    @IsNumber()
    pageNo: number;
    @ApiPropertyOptional({
        required: true,
        default: 15,
        description: "limit number",
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchbytext: string

    @ApiPropertyOptional()
    @IsNumber()
    @IsNotEmpty()
    organizationId: number


    @ApiPropertyOptional({
        example: "Active",
        enum: [
            "Active",
            "InActive",
        ],
    })
    @IsOptional()
    @IsEnum(StatusFilter)
    status: StatusFilter;

}