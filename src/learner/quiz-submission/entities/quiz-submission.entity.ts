import { ApiProperty } from "@nestjs/swagger";
import { interactive_quiz_submissions } from "@prisma/client";

export class QuizSubmission {}

export class QuizSubmissionEntity implements interactive_quiz_submissions {
  deleted_at: Date;
  is_active: boolean;

  @ApiProperty() is_correct: number;
  @ApiProperty() interactive_quiz_result_id: number;
  @ApiProperty() id: number;
  @ApiProperty() learner_id: number;
  @ApiProperty() course_id: number;
  @ApiProperty() content_session_id: number;
  @ApiProperty() question_id: number;
  @ApiProperty() question_option_id: number;
  @ApiProperty() institute_id: number;
  @ApiProperty() submission_date: Date;
  @ApiProperty() organization_id: number;
  created_at: Date;
  updated_at: Date;
  is_submitted: boolean;
}

export class RegisterQuizSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateQuizSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteQuizSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}

export class QuizSubmissionStats {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Successfully Fetched",
  })
  message: string;
}
