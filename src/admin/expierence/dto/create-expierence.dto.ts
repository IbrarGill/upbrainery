import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateExpierenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
