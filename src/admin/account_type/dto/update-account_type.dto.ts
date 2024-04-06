import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateAccountTypeDto } from "./create-account_type.dto";

export class UpdateAccountTypeDto extends PartialType(CreateAccountTypeDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountTypeName: string;
}
