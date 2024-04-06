import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class CreateSessionTypeDto {
  @ApiProperty({
    description: "Enter the name of the Session to create.",
  })
  @IsNotEmpty()
  @IsString()
  sessionName: string;
}
