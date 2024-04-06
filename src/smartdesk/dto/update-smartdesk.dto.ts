import { PartialType } from '@nestjs/mapped-types';
import { CreateSmartdeskDto } from './create-smartdesk.dto';

export class UpdateSmartdeskDto extends PartialType(CreateSmartdeskDto) {}
