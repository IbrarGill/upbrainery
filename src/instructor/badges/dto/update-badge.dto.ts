import { PartialType } from '@nestjs/mapped-types';
import { CreateBadgeDto, CreateBadgeTypeDto } from './create-badge.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateBadgeDto extends PartialType(CreateBadgeDto) {
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
    @IsNumber()
    @IsNotEmpty()
    no_of_courses: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    instructor_id: number

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
    availability_id: number;


    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    amount: number;
}


export class UpdateCreateBadgeTypeDto extends PartialType(CreateBadgeTypeDto)
{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
}