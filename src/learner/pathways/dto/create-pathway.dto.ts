import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { contentLevel } from "src/constant/constant";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class Clusters {
  @ApiProperty()
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

class Badges {
  @ApiProperty()
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class Levels {
  @ApiProperty()
  @IsNumber()
  certification_id: number;

  @ApiProperty({ example: [1, 2, 3] })
  // @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => Badges)
  badges: Badges[];
}

export class CreatePathwayDto {
  @ApiProperty({ example: "title" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cluster_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  badge_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  certification_level_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  learner_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  organization_id: number;
}
export class AddPathwaysLevelDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  pathway_id: number;

  @ApiProperty({ example: contentLevel })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => Levels)
  levels: Levels[];
}

export class AddPathwaysClusterDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  pathway_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cluster_id: number;
}
export class AddPathwayDto {
  @ApiProperty({ example: "title" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  // @ApiProperty({ example: [1, 2, 3] })
  // @IsArray()
  // @Type(() => Clusters)
  // clusters: Clusters[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cluster_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  from_grade_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  to_grade_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  organization_id: number;
}

export class CreatePathwayApproval {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_approved: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  pathway_request_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  pathway_id: number;
}

export class SearchPathwayDto {
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

  @ApiPropertyOptional({ example: "string" })
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  instructor_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  cluster_id: number;
}

export class SearchCLusterPathwayDto {
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

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  cluster_id: number;
}

export class SearchPathwayRequests {
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

  @ApiPropertyOptional({ example: "string" })
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  learner_id: number;
}

export class SearchPathwayApprovals {
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

  @ApiPropertyOptional({ example: "string" })
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  instructor_id: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_approved: boolean;
}
