import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { interactives } from "@prisma/client";

export class Quiz { }

export class QuizEntity implements interactives {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() duration: number;
  @ApiProperty() from_grade_id: number;
  @ApiProperty() to_grade_id: number;
  @ApiProperty() Quiz_type_id: number;
  @ApiProperty() instructor_id: number;
  @ApiProperty() institute_id: number;
  @ApiPropertyOptional() isDraft: boolean;
  @ApiProperty() organization_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  deleted_at: Date;
  is_duplicate: boolean;
  interactive_type_id: number;
}

export class RegisterQuiz {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateQuiz {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteQuiz {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
