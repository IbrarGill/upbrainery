import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
enum orderByList {
  Latest = "Latest",
  Oldest = "Oldest",
}

export class CreateClusterDto {
  @ApiProperty({ example: "title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  color_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  from_grade_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  to_grade_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  instructor_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  organization_id: number;
}

export class SearchClusterDto {
  @ApiPropertyOptional({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiPropertyOptional({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  instructor_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  learner_id: number;

  @ApiPropertyOptional({
    example: "Latest",
    enum: ["Latest", "Oldest"],
  })
  @IsOptional()
  @IsEnum(orderByList)
  orderBy: orderByList;
}

export class SearchInstructorClusterDto {
  @ApiPropertyOptional({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiPropertyOptional({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  instructor_id: number;

  @ApiPropertyOptional({ description: "Send 1 for true/ Send 0 for false" })
  @IsOptional()
  @IsOptional()
  private_to_instructor: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional({
    example: "Latest",
    enum: ["Latest", "Oldest"],
  })
  @IsOptional()
  @IsEnum(orderByList)
  orderBy: orderByList;
}

export class colordto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  colorName: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hex_code: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}
