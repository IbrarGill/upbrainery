import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreatePathwayDto } from "./create-pathway.dto";
import { contentLevel } from "src/constant/constant";
import { Type } from "class-transformer";

export class UpdatePathwayDto extends PartialType(CreatePathwayDto) {
  @ApiPropertyOptional({ example: "title" })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ example: "description" })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  cluster_id: number;

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

class Badges {
  @ApiProperty()
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class Levels {
  @ApiPropertyOptional()
  @IsNumber()
  certification_id: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsArray()
  @Type(() => Badges)
  badges: Badges[];
}
export class UpdatePathwaysLevelDto {
  @ApiPropertyOptional({ example: contentLevel })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => Levels)
  levels: Levels[];
}
