import { ApiProperty } from "@nestjs/swagger";
import { interactive_quest_submissions } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export class QuestSubmission { }

export class QuestSubmissionEntity implements interactive_quest_submissions {

  deleted_at: Date;
  updated_at: Date;
  created_at: Date;
  is_active: boolean;

  @ApiProperty() id: number;
  @ApiProperty() learner_id: number;
  @ApiProperty() course_id: number;
  @ApiProperty() content_session_id: number;
  @ApiProperty() interactive_id: number;
  @ApiProperty() video_description: string;
  @ApiProperty() institute_id: number;
  @ApiProperty() submission_date: Date;
  @ApiProperty() organization_id: number;
  @ApiProperty() is_submitted: boolean;
  @ApiProperty() marks: number;
  @ApiProperty() total_marks: number;
}

export class RegisterQuestSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateQuestSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteQuestSubmission {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
