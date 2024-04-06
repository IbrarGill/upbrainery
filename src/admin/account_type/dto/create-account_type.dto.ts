import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAccountTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountTypeName: string;
}
