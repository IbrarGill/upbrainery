import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateActivitiesSubmissionDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    learner_id: number;

    @ApiProperty({ example: 0 })
    @IsNumber()
    @IsNotEmpty()
    course_id: number;

    @ApiProperty({ example: 0 })
    @IsNumber()
    @IsNotEmpty()
    content_session_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    time_spent: number;
}
