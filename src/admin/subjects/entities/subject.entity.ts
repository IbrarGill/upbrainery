import { ApiProperty } from "@nestjs/swagger";
import { subjects } from "@prisma/client";

export class Admin {}

export class RegistereSubject {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class SubjectEntity implements subjects {
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class UpdateSubject {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteSubject {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
