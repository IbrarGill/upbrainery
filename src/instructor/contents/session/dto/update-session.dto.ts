import { PartialType } from '@nestjs/mapped-types';
import { CourseSegment, CreateSessionDto, LearnerList, _instructorList, _learnerList } from './create-session.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateInstructorList {
  @ApiProperty()
  instructorId: number;

  @ApiProperty()
  isDeleted: boolean;
}

export const _updateinstructorList = [
  {
    instructorId: 2,
    isDeleted: false,
  },
];

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiProperty({
    type: "array",
    name: "sessionPhoto",
    description: "user can upload his session picture",
    items: { type: "string", format: "binary" },
  })
  sessionPhoto: any;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  instructor_id: number;

  @ApiPropertyOptional({ example: "test session" })
  @IsString()
  sessionName: string;

  @ApiPropertyOptional({ example: "session description" })
  @IsString()
  sessionDescription: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  sessionAvailabilityId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  sessionWorkTypeId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  sessionTypeId: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  startAge: number;

  @ApiPropertyOptional({ example: 14 })
  @IsNumber()
  endAge: number;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ example: "2023-04-22T00:00:00.000Z" })
  @IsString()
  startDate: string;

  @ApiPropertyOptional({ example: "2023-04-22T00:00:00.000Z" })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(99)
  price: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  availableToPurchase: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  is_published: boolean;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  pd_session: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  course_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  isDraft: number;

  @ApiPropertyOptional({ example: _learnerList })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => LearnerList)
  learnerList: LearnerList[]

  @ApiProperty({ example: _updateinstructorList })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => UpdateInstructorList)
  instructorList: UpdateInstructorList[];

  @ApiPropertyOptional()
  //@Transform(({ value }) => { if (value) { return JSON.parse(value) } })
  courseSegment: CourseSegment
}
