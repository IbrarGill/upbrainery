import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSmartdeskTypeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
}
