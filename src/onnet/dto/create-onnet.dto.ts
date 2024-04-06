import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOnnetDto {}

export class OnnetFilters {
  @ApiPropertyOptional({
    example: "553421321134342523523523254115342111351145453111231155343444",
  })
  @IsOptional()
  @IsString()
  answer: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  learner_id: number;
}

export class OnnetQuery {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  learner_id: number;


  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  job_zone: number;
}
