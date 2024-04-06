import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseInterceptors,
  UploadedFiles,
  Query,
} from "@nestjs/common";
import { SharedApiService } from "./shared-api.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { UserUpbraineryGallery } from "src/AssetValidation/userUpbraineryGallery";
import { AR3dModelDto, CreateUserGalleryDto, QueryUserGalleryDto } from "./dto/create-shared-api.dto";
import { AR3Dmodelvalidation } from "src/AssetValidation/augmented3dmodel";
@ApiTags("Shared API")
@Controller()
export class SharedApiController {
  constructor(private readonly sharedApiService: SharedApiService) { }

  @Post("uploadtogallery")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(UserUpbraineryGallery)
  uploadtogallery(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: CreateUserGalleryDto,
    @Res() response: Response) {
    return this.sharedApiService.uploadtogallery(files, dto, response);
  }

  @Get("getmygallery")
  getmygallery(@Query() query: QueryUserGalleryDto, @Res() response: Response) {
    return this.sharedApiService.getmygallery(query, response);
  }

  @Get("getallattachmenttypes")
  getallattachmenttypes(@Res() response: Response) {
    return this.sharedApiService.getallattachmenttypes(response);
  }

  @Post("uploadAR3dmodel")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(AR3Dmodelvalidation)
  upload3dmodel(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: AR3dModelDto,
    @Res() response: Response) {
    return this.sharedApiService.upload3dmodel(files, dto, response);
  }


}
