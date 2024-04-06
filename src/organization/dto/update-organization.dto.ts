import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    organizationName: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_name: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    contact_no: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    organization_type_id: number
}


export class UpdateOrganizationUserDto {

    @ApiProperty({
        type: "array",
        name: "avator",
        description: "user can upload his profile picture",
        items: { type: "string", format: "binary" },
    })
    avator: any;


    @ApiProperty({
        type: "array",
        name: "OrganizationLogo",
        description: "user can upload his profile picture",
        items: { type: "string", format: "binary" },
    })
    OrganizationLogo: any;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    organizationName: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contact_no: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    organization_type_id: number
}