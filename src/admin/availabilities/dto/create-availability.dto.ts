import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAvailabilityDto {
  @ApiProperty({
    description: "Enter the name of the availabilty to create.",
  })
  @IsNotEmpty()
  @IsString()
  availabilityTitle: string;
}
