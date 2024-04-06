import { ApiProperty } from "@nestjs/swagger";
import { module_segment_types } from "@prisma/client";

export class ModuleSegmentType {}

export class ModuleSegmentTypeEntity implements module_segment_types {
  deleted_at: Date;
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  created_at: Date;
  updated_at: Date;
}

export class RegisteredModuleSegmentTypeEntity {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateModuleSegmentTypeEntity {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteModuleSegmentTypeEntity {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
