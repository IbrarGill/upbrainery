import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSmartdeskDto {
  @ApiPropertyOptional()
  id: number | null;
  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  smartdesk_type_id: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  learner_id: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  course_id: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  content_session_id: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  editor_json: string;
}

export class SearchSmartdeskDto {
  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  smartdesk_type_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  learner_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  content_session_id: number;
}

export class QuerySmartDeskDto {
  @ApiProperty()
  @IsNumber()
  smartdesk_type_id: number;
  @ApiProperty()
  @IsNumber()
  learner_id: number;
  @ApiProperty()
  @IsNumber()
  course_id: number;
  @ApiProperty()
  @IsNumber()
  content_session_id: number;
}
