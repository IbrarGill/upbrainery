import { PartialType } from "@nestjs/mapped-types";
import { CreateSkillDto } from "./create-skill.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  @ApiProperty({
    description: "Enter the name of the Skill to Update.",
  })
  @IsNotEmpty()
  @IsString()
  skillName: string;
}
