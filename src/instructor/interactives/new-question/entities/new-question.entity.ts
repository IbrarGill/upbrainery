import { ApiProperty } from "@nestjs/swagger";
import { questions } from "@prisma/client";

export class NewQuestion {}

export class NewQuestionEntity implements questions {
  is_active: boolean;

  @ApiProperty() id: number;
  @ApiProperty() question: string;
  @ApiProperty() points: number;
  @ApiProperty() question_body: string;
  @ApiProperty() interactive_subject_id: number;
  @ApiProperty() instructor_id: number;
  @ApiProperty() interactive_type_id: number;
  @ApiProperty() institute_id: number;
  @ApiProperty() organization_id: number;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class RegistereNewQuestion {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateNewQuestion {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteNewQuestion {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
