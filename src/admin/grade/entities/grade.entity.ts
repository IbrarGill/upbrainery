import { ApiProperty } from "@nestjs/swagger";
import { grades } from "@prisma/client";

export class Grade {}
export class GradeEntity implements grades {
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class RegisteredGrade {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateGrade {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteGrade {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
