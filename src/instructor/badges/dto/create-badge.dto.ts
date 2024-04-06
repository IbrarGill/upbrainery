import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, isNotEmpty } from "class-validator";
import { isNumber } from "lodash";
enum orderByList {
    LatestActivities = "Latest Badges",
    OldestBadges = "Oldest Badges",
    SortByAZ = "Sort By A-Z",
    SortByZA = "Sort By Z-A",
}

enum StatusList {
    Active = "Active",
    Draft = "Draft",
}

const badge_courses_data = [
    {
        courseId: 23,
    }
]

export class badge_courses_dto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    courseId: number;
}
const pathway_badges_data = [
    {
        pathway_level_id: 23,
        pathway_id: 1
    }
]
export class pathway_badges_dto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    pathway_level_id: number;
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    pathway_id: number
}

export class CreateBadgeDto {

    @ApiProperty({
        type: "array",
        name: "BadgeImage",
        items: { type: "string", format: "binary" },
    })
    BadgeImage: any;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;
    @ApiProperty()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    badge_type_id: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    no_of_courses: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    instructor_id: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    availability_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    organization_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    is_draft: number


    @ApiPropertyOptional({ example: badge_courses_data })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => badge_courses_dto)
    badge_courses: badge_courses_dto[];


    @ApiPropertyOptional({ example: pathway_badges_data })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => pathway_badges_dto)
    pathway_badges: pathway_badges_dto[];
}

export class Searchbadges {
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

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchByText: string

    @ApiPropertyOptional({ description: "organization id" })
    @IsOptional()
    @IsNumber()
    organization_id: number;

    @ApiPropertyOptional({ description: "Current UserId" })
    @IsOptional()
    @IsNumber()
    instuctorId: number;

    @ApiPropertyOptional({ description: "badges type Id" })
    @IsOptional()
    @IsNumber()
    badgeTypeId: number;

    @ApiPropertyOptional({
        example: "Latest Activities",
        enum: [
            "Latest Badges",
            "Oldest Badges",
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


export class CreateBadgeTypeDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
}



export class SearchbadgesType {

    @ApiPropertyOptional({ description: "organization Id" })
    @IsOptional()
    @IsNumber()
    organization_Id: number;


    @ApiPropertyOptional({ description: "Current UserId" })
    @IsOptional()
    @IsNumber()
    instuctorId: number;

}