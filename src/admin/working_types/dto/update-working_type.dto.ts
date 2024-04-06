import { PartialType } from "@nestjs/mapped-types";
import { CreateWorkingTypeDto } from "./create-working_type.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class UpdateWorkingTypeDto extends PartialType(CreateWorkingTypeDto) {
  @ApiProperty({
    description: "Enter the name of the WorkingType to update.",
  })
  @IsNotEmpty()
  @IsString()
  workingType: string;
}
