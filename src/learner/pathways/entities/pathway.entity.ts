import { ApiProperty } from "@nestjs/swagger";
import { pathways } from "@prisma/client";

export class Pathway { }

export class PathwayEntity implements pathways {

  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() is_active: boolean;
  @ApiProperty() cluster_id: number;
  @ApiProperty() badge_id: number;
  @ApiProperty() organization_id: number;
  @ApiProperty() instructor_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  created_by: number;
}

export class RegisterPathway {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdatePathway {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeletePathway {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
