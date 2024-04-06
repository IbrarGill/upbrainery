import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsNumber()
  learner_id: number;

  @ApiProperty()
  @IsNumber()
  instructor_id: number;
}

export class SearchSchedule {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ description: "Instructor Id" })
  @IsOptional()
  @IsNumber()
  instructor_id: number;

  @ApiPropertyOptional({ description: "Learner Id" })
  @IsOptional()
  @IsNumber()
  learner_id: number;
}
