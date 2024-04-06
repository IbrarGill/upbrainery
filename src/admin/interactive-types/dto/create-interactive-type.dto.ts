import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateInteractiveTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
