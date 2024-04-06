import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateModuleSegmentDeliveryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
