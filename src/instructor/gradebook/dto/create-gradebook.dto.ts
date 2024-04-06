import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class QueryInteractiveLearnersList {
    @ApiProperty()
    @IsNumber()
    course_id: number;
    @ApiProperty()
    @IsNumber()
    interactiveId: number;
    @ApiProperty()
    @IsNumber()
    content_session_id: number;

    @ApiProperty()
    @IsNumber()
    interactiveTypeId: number;
}


export class QueryLearnerQuizDetails {
    @ApiProperty()
    @IsNumber()
    course_id: number;

    @ApiProperty()
    @IsNumber()
    learnerId: number;

    @ApiProperty()
    @IsNumber()
    interactiveResultId: number;

    @ApiProperty()
    @IsNumber()
    interactiveId: number;
    @ApiProperty()
    @IsNumber()
    content_session_id: number;

}