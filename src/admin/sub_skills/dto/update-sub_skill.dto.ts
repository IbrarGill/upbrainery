import { PartialType } from "@nestjs/mapped-types";
import { CreateSubSkillDto } from "./create-sub_skill.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UpdateSubSkillDto extends PartialType(CreateSubSkillDto) {
  @ApiProperty({
    description: "Enter the title of the SubSkill to create.",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Enter the SkillId of the Skill to create.",
  })
  @IsNotEmpty()
  @IsNumber()
  skillId: number;
}
