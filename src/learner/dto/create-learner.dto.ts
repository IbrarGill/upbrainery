import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class CreateLearnerDto {}



export class LearnerQuery {
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
  
  }