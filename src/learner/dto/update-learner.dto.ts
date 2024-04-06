import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class LearnerHobbies {
    @ApiProperty()
    @IsNumber()
    learner_hobby: number
}
export class LearnerInterest {
    @ApiProperty()
    @IsNumber()
    learner_interest: number
}

export class LearnerGoals {
    @ApiProperty()
    @IsNumber()
    learner_goal: number
}

export class LearnerSkills {
    @ApiProperty()
    @IsNumber()
    learner_skill: number
}

export class LearnerCareerInterest {
    @ApiProperty()
    @IsNumber()
    career_interest_id: number
}

const _learner_hobbies_list = [
    {
        learner_hobby: 1,
    },
    {
        learner_hobby: 2,
    },
];

const _learner_interest_list = [
    {
        learner_interest: 1,
    },
    {
        learner_interest: 2,
    },
];

const _learner_goal_list = [
    {
        learner_goal: 1,
    },
    {
        learner_goal: 2,
    },
];

const _learner_skill_list = [
    {
        learner_skill: 1,
    },
    {
        learner_skill: 2,
    },
];

const _career_interest_list = [
    {
        career_interest_id: 1,
    },
    {
        career_interest_id: 2,
    },
];

export class UpdateLearnerDto {

    @ApiProperty({
        type: "array",
        name: "avator",
        description: "user can upload his profile picture",
        items: { type: "string", format: "binary" },
    })
    avator: any;

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



    @ApiProperty()
    @IsString()
    grades: string;

    @ApiPropertyOptional({
        example: "12-12-12",
    })
    @IsString()
    @IsOptional()
    DOB: string;


    @ApiProperty()
    @IsString()
    carrier_interest: string

    @ApiPropertyOptional({ example: _learner_hobbies_list })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => LearnerHobbies)
    learner_hobbies: LearnerHobbies[];

    @ApiPropertyOptional({ example: _learner_interest_list })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => LearnerInterest)
    learner_interest: LearnerInterest[];


    @ApiPropertyOptional({ example: _learner_goal_list })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => LearnerGoals)
    learner_goals: LearnerGoals[];

    @ApiPropertyOptional({ example: _learner_skill_list })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => LearnerSkills)
    learner_skills: LearnerSkills[];

    @ApiPropertyOptional({ example: _career_interest_list })
    @Transform(({ value }) => JSON.parse(value))
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @Type(() => LearnerCareerInterest)
    Learner_Career_Interest: LearnerCareerInterest[];


}
