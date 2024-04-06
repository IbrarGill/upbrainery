import { ApiProperty } from "@nestjs/swagger";
import { schedules } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export class Schedule {}

export class ScheduleEntity implements schedules {
  deleted_at: Date;
  updated_at: Date;
  created_at: Date;
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty() schdule_date: Date;
  @ApiProperty() min_duration: number;
  @ApiProperty() max_duration: number;
  @ApiProperty() on_demand: boolean;
  @ApiProperty() price: Decimal;
  @ApiProperty() start_time: Date;
  @ApiProperty() end_time: Date;
  @ApiProperty() learner_id: number;
  @ApiProperty() instructor_id: number;
  @ApiProperty() institute_id: number;
  @ApiProperty() organization_id: number;
  @ApiProperty() description: string;
}

export class RegisterSchedule {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateSchedule {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteSchedule {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
