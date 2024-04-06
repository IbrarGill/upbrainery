import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateContentTypeDto {
    @ApiProperty()
    @IsString()
    contentType: string;
}
