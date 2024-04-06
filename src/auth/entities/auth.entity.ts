import { ApiProperty } from "@nestjs/swagger";
import { users } from "@prisma/client";
import { httpstatus } from "aws-sdk/clients/glacier";
import { UserEntity } from "src/user/entities/user.entity";

export class Auth {}

export class token {
  @ApiProperty() access_token: string;
  @ApiProperty() refresh_token: string;
}

export class LoginResponse {
  @ApiProperty() tokens: token;
  @ApiProperty() user: UserEntity;
}

export class RegisteredResponse {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Successfully Registered",
  })
  message: string;
}

export class PasswordChanged {
  @ApiProperty({
    example: 200,
  })
  status: number;
  @ApiProperty({
    example: "Password Changed Successfully!!",
  })
  message: string;
}
