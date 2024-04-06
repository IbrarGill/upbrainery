import { ApiProperty } from "@nestjs/swagger";
import { module_segment_deliveries } from "@prisma/client";

export class ModuleSegmentDelivery {}

export class ModuleSegmentDeliveryEntity implements module_segment_deliveries {
  deleted_at: Date;
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  created_at: Date;
  updated_at: Date;
}

export class RegisteredModuleSegmentDelivery {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateModuleSegmentDelivery {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteModuleSegmentDelivery {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
