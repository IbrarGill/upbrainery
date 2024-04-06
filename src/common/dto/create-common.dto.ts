import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommonDto { }

export class UploadVideoDto {
  @ApiProperty({ example: "Interactive" })
  @IsString()
  @IsNotEmpty()
  model_Name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  attachment_Id: number;

  @ApiProperty({
    type: "array",
    name: "videoAttachment",
    description: "User can upload video",
    items: { type: "string", format: "binary" },
  })
  videoAttachment: any;
}

export class UpdateVideoDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  attachment_Id: number;

  @ApiProperty({
    type: "array",
    name: "videoAttachment",
    description: "User can upload video",
    items: { type: "string", format: "binary" },
  })
  videoAttachment: any;
}

export class UploadImageDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  userId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model_Name: string;


  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  attachment_Id: number;

  @ApiProperty({
    type: "array",
    name: "imageAttachment",
    description: "User can upload image",
    items: { type: "string", format: "binary" },
  })
  imageAttachment: any;
}

export class GetImageAttachment {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model_Name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  attachment_Id: number;
}

export class GetNotifications {
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
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organization_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  user_id: number;
}
