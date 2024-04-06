import { PartialType } from '@nestjs/mapped-types';
import { CreateSmartdeskTypeDto } from './create-smartdesk-type.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSmartdeskTypeDto extends PartialType(CreateSmartdeskTypeDto) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
}
