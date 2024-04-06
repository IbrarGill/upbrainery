import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

enum FileTypeList {
    JPEG = "JPEG",
    PNG = "PNG",
    PDF = "PDF",
    MicrosoftWord = "Microsoft Word",
    MicrosoftExcel = "Microsoft Excel",
    MicrosoftPowerPoint = "Microsoft PowerPoint",
    PlainText = "Plain Text",
    MP3 = "MP3",
    MP4 = "MP4",
    AVI = "AVI",
    MOV = "MOV",
    WMV = "WMV",
    MKV = "MKV",
    CSV = "CSV",
    JSON = "JSON",
    XML = "XML"
}

export class CreateUserGalleryDto {
    @ApiProperty({
        type: "array",
        name: "Files",
        description: "user can upload his file",
        items: { type: "string", format: "binary" },
    })
    Files: any;


    @ApiProperty({ description: "Current instuctorId" })
    @IsNumber()
    userId: number;

    @ApiProperty({ description: "Current organizationId" })
    @IsNumber()
    organizationId: number;

    @ApiProperty({ description: "Availabilitty id" })
    @IsNumber()
    availabilityId: number

    @ApiProperty()
    @IsNumber()
    attachmenttypeId: number;
}

enum orderByList {
    LatestAttachments = "Latest Attachments",
    OldestAttachments = "Oldest Attachments",
}
export class QueryUserGalleryDto {
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

    @ApiProperty()
    @IsString()
    @IsOptional()
    searchByText: string;

    @ApiProperty({ description: "Current instuctorId" })
    @IsNumber()
    userId: number;

    @ApiProperty({ description: "Current organizationId" })
    @IsNumber()
    @IsOptional()
    organizationId: number;

    @ApiProperty({ description: "Availabilitty id" })
    @IsNumber()
    @IsOptional()
    availabilityId: number

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    attachmenttypeId: number;


    @ApiPropertyOptional({
        example: "Latest Attachments",
        enum: [
            "Latest Attachments",
            "Oldest Attachments",
        ],
    })
    @IsOptional()
    @IsEnum(orderByList)
    orderBy: orderByList;
}


//====================

export class AttachmentsToARDto {
    @ApiProperty()
    @IsNumber()
    attachmentId: number
}

export const _attachmentsToARDto = [
    {
        attachmentId: 9232,
    },
];

export class AR3dModelDto {
    @ApiProperty({
        type: "array",
        name: "ARModel3D",
        description: "user can upload his file",
        items: { type: "string", format: "binary" },
    })
    ARModel3D: any;

    @ApiProperty({ description: "Current organizationId" })
    @IsNumber()
    organizationId: number;

    @ApiProperty({ description: "Current UserId" })
    @IsNumber()
    userId: number;

    @ApiPropertyOptional({ example: _attachmentsToARDto })
    @Transform(({ value }) => { if (value) return JSON.parse(value) })
    @ValidateNested({ each: true, always: true })
    @IsArray()
    @IsOptional()
    @Type(() => AttachmentsToARDto)
    attachmenttoARList: AttachmentsToARDto[];
}