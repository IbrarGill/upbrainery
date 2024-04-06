import { PartialType } from '@nestjs/mapped-types';
import { CreatePollingDto, PollOptionDto } from './create-polling.dto';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePollingDto extends PartialType(CreatePollingDto) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    instructor_id: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    session_id: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    no_of_students: number

    @ApiProperty({
        type: [PollOptionDto],
    })
    @ValidateNested({ each: true })
    @Type(() => PollOptionDto)
    @ArrayNotEmpty()
    pollOptions: PollOptionDto[];
}
