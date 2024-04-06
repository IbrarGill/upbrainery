import { ApiProperty } from "@nestjs/swagger";
import { interactive_assignment_submissions } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export class AssignmentSubmission {}

export class AssignmentSubmissionEntity
  implements interactive_assignment_submissions
{
  assignment_result_id: number;
  deleted_at: Date;
  is_active: boolean;
  @ApiProperty() interactive_id: number;
  @ApiProperty() id: number;
  @ApiProperty() learner_id: number;
  @ApiProperty() course_id: number;
  @ApiProperty() content_session_id: number;
  @ApiProperty() question_id: number;
  @ApiProperty() answer: string;
  @ApiProperty() institute_id: number;
  @ApiProperty() submission_date: Date;
  @ApiProperty() organization_id: number;
  @ApiProperty() obtained_marks: number;
  @ApiProperty() total_marks: number;
  created_at: Date;
  updated_at: Date;
  is_submitted: boolean;
}

export class RegisterAssignmentSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateAssignmentSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteAssignmentSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
