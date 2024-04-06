import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateAvailabilityDto } from "./create-availability.dto";

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {
  @ApiProperty({
    description: "Enter the name of the availabilty to Update.",
  })
  @IsNotEmpty()
  @IsString()
  availabilityTitle: string;
}
