import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCertificationsLevelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class SearchCLusterPathwayDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title: string;
}
