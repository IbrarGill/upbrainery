import { PartialType } from "@nestjs/mapped-types";
import { CreateStandardTypeDto } from "./create-standard_type.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class UpdateStandardTypeDto extends PartialType(CreateStandardTypeDto) {
  @ApiProperty({
    description: "Enter the name of the Standard to update.",
  })
  @IsNotEmpty()
  @IsString()
  standardType: string;
}
