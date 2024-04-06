import { PartialType } from "@nestjs/mapped-types";
import { CreateSessionTypeDto } from "./create-session_type.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class UpdateSessionTypeDto extends PartialType(CreateSessionTypeDto) {
  @ApiProperty({
    description: "Enter the name of the Session to create.",
  })
  @IsNotEmpty()
  @IsString()
  sessionName: string;
}
