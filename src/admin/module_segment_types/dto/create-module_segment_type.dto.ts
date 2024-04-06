import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateModuleSegmentTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
