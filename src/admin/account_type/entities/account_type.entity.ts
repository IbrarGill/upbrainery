import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { account_types } from "@prisma/client";
import { integer } from "aws-sdk/clients/cloudfront";

export class AccountType {}

export class RegisteredAccounttype {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Registered Successfully",
  })
  message: string;
}

export class AccountTypeEntity implements account_types {
  is_active: boolean;
  @ApiProperty() id: integer;
  @ApiProperty() name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export class UpdateAccounttype {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Update Successfully",
  })
  message: string;
}

export class DeleteAccounttype {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Delete Successfully",
  })
  message: string;
}
