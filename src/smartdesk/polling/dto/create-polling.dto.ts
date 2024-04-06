import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class PollOptionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    asnwer: string;
}


export class CreatePollingDto {
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


export class SubmitPollDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    poll_question_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    poll_question_option_id: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    learner_id: number

}

enum orderByList {
    LatestPoll = "Latest Poll",
    OldestPoll = "Oldest Poll",
    SortByQuestionsASC = "Sort By Questions ASC",
    SortByQuestionsDESC = "Sort By Questions DESC",
}

export class PollQuery {

    @ApiPropertyOptional({ description: "Current UserId" })
    @IsOptional()
    @IsNumber()
    instuctorId: number;

    @ApiPropertyOptional({ description: "Current UserId" })
    @IsOptional()
    @IsNumber()
    session_id: number;

}