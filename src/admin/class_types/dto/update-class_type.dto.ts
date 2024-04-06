import { PartialType } from '@nestjs/mapped-types';
import { CreateClassTypeDto } from './create-class_type.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassTypeDto extends PartialType(CreateClassTypeDto) {
    @ApiProperty()
    classtypeName: string;
}
