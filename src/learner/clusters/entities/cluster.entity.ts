import { ApiProperty } from "@nestjs/swagger";
import { clusters } from "@prisma/client";

export class Cluster { }

export class ClusterEntity implements clusters {
  progress: number;

  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() is_active: boolean;
  @ApiProperty() color_id: number;
  @ApiProperty() from_grade_id: number;
  @ApiProperty() to_grade_id: number;
  @ApiProperty() instructor_id: number;
  @ApiProperty() organization_id: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class RegisterCluster {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class UpdateCluster {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteCluster {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
