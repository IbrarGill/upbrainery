import { ApiProperty } from "@nestjs/swagger";
import { interactive_types } from "@prisma/client";

export class InteractiveType {}

export class InteractiveTypeEntity implements interactive_types {
  deleted_at: Date;
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  created_at: Date;
  updated_at: Date;
}

export class RegistereInteractiveType {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateInteractiveType {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteInteractiveType {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
