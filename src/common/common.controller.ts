import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommonService } from "./common.service";
import {
  UploadVideoDto,
  UploadImageDto,
  GetImageAttachment,
  GetNotifications,
} from "./dto/create-common.dto";
import { Response } from "express";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  ImageValidation,
  videoValidation,
} from "src/AssetValidation/InteractivesImageValidation";
import { UserNotificationQuery } from "src/user/dto/create-user.dto";
import { JwtGuard } from "src/authStrategy/guard";

@ApiTags("common")
@Controller("common")
// @ApiSecurity("JWT-AUTH")
// @UseGuards(JwtGuard)
export class CommonController {
  constructor(private readonly commonService: CommonService) { }

  @Post("video-upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(videoValidation)
  uploadVideo(
    @UploadedFiles() files: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
    @Res() response: Response
  ) {
    return this.commonService.video(files, uploadVideoDto, response);
  }

  @Patch("video-update")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(videoValidation)
  updateVideo(
    @UploadedFiles() files: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
    @Res() response: Response
  ) {
    return this.commonService.updateVideo(files, uploadVideoDto, response);
  }

  @Post("image-upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ImageValidation)
  uploadImage(
    @UploadedFiles() files: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
    @Res() response: Response
  ) {
    return this.commonService.image(files, uploadImageDto, response);
  }

  @Patch("image-update")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ImageValidation)
  updateImage(
    @UploadedFiles() files: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
    @Res() response: Response
  ) {
    return this.commonService.updateimage(files, uploadImageDto, response);
  }

  @Get("allattachements")
  getallattachment(@Res() response: Response) {
    return this.commonService.allattachements(response);
  }

  @Get("usernotification")
  userNotification(
    @Query() query: UserNotificationQuery,
    @Res() response: Response
  ) {
    return this.commonService.userNotifcation(query, response);
  }

  @Get("delete/usernotification")
  deleteUserNotification(
    @Query() query: UserNotificationQuery,
    @Res() response: Response
  ) {
    return this.commonService.deleteUserNotification(query, response);
  }

  @Get("getimagepath")
  getimagepath(@Query() query: GetImageAttachment, @Res() response: Response) {
    return this.commonService.getimageattachment(query, response);
  }

  // @Get("notifications")
  // getNotifications(
  //   @Query() query: GetNotifications,
  //   @Res() response: Response
  // ) {
  //   return this.commonService.getNotifications(query, response);
  // }
}
