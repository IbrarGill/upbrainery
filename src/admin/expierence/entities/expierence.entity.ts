import { ApiProperty } from "@nestjs/swagger";
import { experty_levels } from "@prisma/client";

export class Expierence {}

export class ExperinceEntity implements experty_levels {
  is_active: boolean;
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class RegistereExpierence {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateExpierence {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteExpierence {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
