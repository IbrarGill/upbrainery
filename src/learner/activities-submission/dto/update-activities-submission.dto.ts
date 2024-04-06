import { PartialType } from '@nestjs/mapped-types';
import { CreateActivitiesSubmissionDto } from './create-activities-submission.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateActivitiesSubmissionDto extends PartialType(CreateActivitiesSubmissionDto) {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    learner_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    session_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    activity_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    time_spent: number;
}
