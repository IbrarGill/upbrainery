import { PartialType } from '@nestjs/mapped-types';
import { CreateInstructorDto } from './create-instructor.dto';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TutorBio, TutorCredentails, TutorExpierence, TutorTeachingStyle } from 'src/constant/constant';
import { TutorCredentailsDto, TutorExpierencedto, TutorteachingStyleDto } from 'src/auth/dto/create-auth.dto';

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {
    @ApiProperty({
        type: "array",
        name: "avator",
        description: "user can upload his profile picture",
        items: { type: "string", format: "binary" },
    })
    avator: any;


    @ApiProperty({
        type: "array",
        name: "InstructorLicenseFront",
        description: "Instructor can upload his Lincense Front",
        items: { type: "string", format: "binary" },
    })
    InstructorLicenseFront: any;


    @ApiProperty({
        type: "array",
        name: "InstructorLicenseBack",
        description: "Instructor can upload his License Back",
        items: { type: "string", format: "binary" },
    })
    InstructorLicenseBack: any;


    @ApiProperty({
        type: "array",
        name: "InstructorResume",
        description: "Instructor can upload his Resume",
        items: { type: "string", format: "binary" },
    })
    InstructorResume: any;

    @ApiPropertyOptional({
        example: "Umar",
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;
    @ApiPropertyOptional({
        example: "Khan",
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({
        example: "umarkhan@gmail.com",
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({
        example: "umerdev",
    })
    @IsString()
    @IsNotEmpty()
    userName: string;

    @ApiPropertyOptional({
        example: "12-12-12",
    })
    @IsString()
    @IsOptional()
    DOB: string;

    @ApiPropertyOptional({ example: 12 })
    @IsNumber()
    @IsOptional()
    hourlyRate: number;

    @ApiProperty({ example: TutorBio })
    @IsString()
    @IsOptional()
    bio: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    isDrivingLicenseFrontDeleted: number;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    isDrivingLicenseBackDeleted: number;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    isResumeDeleted: number;


    @ApiPropertyOptional({ example: TutorExpierence })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => TutorExpierencedto)
    userexpirence: TutorExpierencedto[]
    @ApiProperty({ example: TutorTeachingStyle })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => TutorExpierencedto)
    teachingStyle: TutorteachingStyleDto[];

    @ApiProperty({ example: TutorCredentails })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => TutorCredentailsDto)
    credentails: TutorCredentailsDto[];

}
