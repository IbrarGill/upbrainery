import { ApiProperty } from "@nestjs/swagger";
import { users } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export class UserEntity implements users {



  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() first_name: string;
  @ApiProperty() last_name: string;
  @ApiProperty() user_name: string;
  @ApiProperty() email: string;
  @ApiProperty() coins: number;
  @ApiProperty() email_verified_at: Date;
  @ApiProperty() password: string;
  @ApiProperty() two_factor_secret: string;
  @ApiProperty() two_factor_recovery_codes: string;
  @ApiProperty() avatar: string;
  @ApiProperty() theme: string;
  @ApiProperty() account_type_id: number;
  @ApiProperty() access_token: string;
  @ApiProperty() refresh_token: string;
  @ApiProperty() remember_token: string;
  @ApiProperty() bio: string;
  @ApiProperty() per_hour_rate: Decimal;
  @ApiProperty() institute_id: number;
  @ApiProperty() organization_id: number;
  @ApiProperty() is_block: boolean;
  @ApiProperty() is_independent: boolean;
  @ApiProperty() password_reset_code: number;
  is_blacklisted: boolean;
  is_term_condition: boolean;
  is_private_policies: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  is_active: boolean;
  created_by: number;
  role_id: number;
  instructor_pd_id: number;
}
