import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateClusterDto } from "./create-cluster.dto";

export class UpdateClusterDto extends PartialType(CreateClusterDto) {
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
  coler_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  from_grade_id: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  to_grade_id: number;
}
