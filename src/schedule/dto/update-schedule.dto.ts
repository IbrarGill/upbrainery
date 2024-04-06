import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { CreateScheduleDto } from "./create-schedule.dto";

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  schedue_date: string;

  @ApiProperty()
  @IsNumber()
  min_duration: number;

  @ApiProperty()
  @IsNumber()
  max_duration: number;

  @ApiProperty()
  @IsBoolean()
  on_demand: boolean;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  start_time: string;

  @ApiProperty()
  @IsString()
  end_time: string;

  @ApiProperty()
  @IsNumber()
  learner_id: number;

  @ApiProperty()
  @IsNumber()
  instructor_id: number;
}
