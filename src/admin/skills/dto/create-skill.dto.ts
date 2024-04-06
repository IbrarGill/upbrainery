import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class CreateSkillDto {
  @ApiProperty({
    description: "Enter the name of the Skill to create.",
  })
  @IsNotEmpty()
  @IsString()
  skillName: string;
}
