import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateUserDto {}

enum userlist {
  All = "All",
  Instructor = "Instructor",
  Parent = "Parent",
  Learner = "Learner",
  Organzation = "Organzation",
}

export class QueryUserDto {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({
    example: "Sort By Title ASC",
    enum: ["All", "Instructor", "Parent", "Learner", "Organzation"],
  })
  @IsEnum(userlist)
  AccountType: userlist;
}

export class UserNotificationQuery {
  @ApiPropertyOptional({ description: "Current UserId" })
  @IsNumber()
  @IsOptional()
  userId: number;
}
