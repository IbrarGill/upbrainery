import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateSubjectDisciplineDto {
  @ApiProperty({
    description: "Enter the name of the Subject Discipline to create.",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Enter the SubjectId of the Subject.",
  })
  @IsNotEmpty()
  @IsNumber()
  subjectId: number;
}
