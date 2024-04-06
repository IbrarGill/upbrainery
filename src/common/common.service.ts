import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  UploadVideoDto,
  UploadImageDto,
  GetImageAttachment,
  GetNotifications,
} from "./dto/create-common.dto";
import { Response } from "express";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommonFunctionsService } from "src/services/commonService";
import { PrismaService } from "src/prisma/prisma.client";

import { UserNotificationQuery } from "src/user/dto/create-user.dto";
@Injectable()
export class CommonService {
  constructor(
    private eventEmitter: EventEmitter2,
    private serviceFunction: CommonFunctionsService,
    private prisma: PrismaService
  ) { }
  async video(
    files: Express.Multer.File,
    uploadVideoDto: UploadVideoDto,
    response: Response
  ) {
    try {
      let video: any = files;
      let eventData = {};
      if (video.videoAttachment) {
        eventData = {
          modelId: uploadVideoDto.attachment_Id,
          path: video.videoAttachment[0].path,
          fileName: video.videoAttachment[0].filename,
          modelName: uploadVideoDto.model_Name,
        };
        this.eventEmitter.emit("event.attachment", eventData);
      }
      response
        .status(HttpStatus.OK)
        .json({ status: "success", message: "Video uploaded successfully" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateVideo(
    files: Express.Multer.File,
    uploadVideoDto: UploadVideoDto,
    response: Response
  ) {
    try {
      let video: any = files;
      let attachments: any = await this.serviceFunction.getAttachments(
        uploadVideoDto.attachment_Id,
        uploadVideoDto.model_Name
      );
      let eventData = {};
      if (video.videoAttachment) {
        if (attachments) {
          eventData = {
            modelId: uploadVideoDto.attachment_Id,
            path: video.videoAttachment[0].path,
            fileName: video.videoAttachment[0].filename,
            modelName: uploadVideoDto.model_Name,
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        } else {
          eventData = {
            modelId: uploadVideoDto.attachment_Id,
            path: video.videoAttachment[0].path,
            fileName: video.videoAttachment[0].filename,
            modelName: uploadVideoDto.model_Name,
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
      }
      response
        .status(HttpStatus.OK)
        .json({ status: "success", message: "Video updated successfully" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async image(
    files: Express.Multer.File,
    dto: UploadImageDto,
    response: Response
  ) {
    try {
      let image: any = files;
      if (image?.imageAttachment) {
        let eventData = {
          modelId: dto.attachment_Id,
          path: image.imageAttachment[0]?.path,
          fileName: image.imageAttachment[0]?.filename,
          modelName: dto.model_Name,
          userId: dto.userId
        };

        this.eventEmitter.emit("event.attachment", eventData);
        response
          .status(HttpStatus.OK)
          .json({ status: "success", message: "Image uploaded successfully" });



      } else {
        throw new HttpException(
          "File Not Uploaded !!",
          HttpStatus.BAD_REQUEST
        );
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async updateimage(
    files: Express.Multer.File,
    uploadImageDto: UploadImageDto,
    response: Response
  ) {
    try {
      let image: any = files;
      console.log(uploadImageDto);
      let attachments: any = await this.serviceFunction.getAttachments(
        uploadImageDto.attachment_Id,
        uploadImageDto.model_Name
      );

      let eventData = {};
      if (image.imageAttachment) {
        if (attachments) {
          eventData = {
            modelId: uploadImageDto.attachment_Id,
            path: image.imageAttachment[0].path,
            fileName: image.imageAttachment[0].filename,
            modelName: uploadImageDto.model_Name,
          };
          this.eventEmitter.emit("event.updateattachment", eventData);
        } else {
          eventData = {
            modelId: uploadImageDto.attachment_Id,
            path: image.imageAttachment[0].path,
            fileName: image.imageAttachment[0].filename,
            modelName: uploadImageDto.model_Name,
          };
          this.eventEmitter.emit("event.attachment", eventData);
        }
      }
      response
        .status(HttpStatus.OK)
        .json({ status: "success", message: "Image updated successfully" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async allattachements(response: Response) {
    try {
      let allattachements = await this.prisma.attachments.findMany({
        select: {
          id: true,
          path: true,
          Image_key: true,
        },
      });
      if (allattachements) response.status(HttpStatus.OK).json(allattachements);
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async userNotifcation(
    query: UserNotificationQuery,
    response: Response
  ) {
    try {
      let notificationCount = await this.prisma.notifications.count({
        where: {
          receiver_user_id: query.userId,
        },
      });
      let notifications: any = await this.prisma.notifications.findMany({
        where: {
          receiver_user_id: query.userId,
        },
        take: 10,
        orderBy: [
          {
            id: "desc",
          },
        ],
        select: {
          id: true,
          notifiable_type: true,
          organization_id: true,
          data: true,
          type: true,
          is_seen: true,
          sender_user_id: true,
          receiver_user_id: true,
        },
      });


      for (let item of notifications) {
        let sender_UserName = await this.prisma.users.findUnique({
          where: {
            id: item.sender_user_id
          },
          select:
          {
            user_name: true
          }

        })
        item.sender_user_name = sender_UserName.user_name;

        let senderattachment = await this.serviceFunction.getAttachments(
          item.sen,
          "User"
        );
        item.sender_image_url = senderattachment.path;

        let receiver_UserName = await this.prisma.users.findUnique({
          where: {
            id: item.receiver_user_id
          },
          select:
          {
            user_name: true
          }
        })
        item.receiver_user_name = receiver_UserName.user_name;

        let receiverattachment = await this.serviceFunction.getAttachments(
          item.sen,
          "User"
        );
        item.receiver_image_url = receiverattachment.path;
      }
      if (notifications) {
        response.status(HttpStatus.OK).json({
          data: notifications,
        });
      }
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async deleteUserNotification(
    query: UserNotificationQuery,
    response: Response
  ) {
    try {
      let deleteNotification = await this.prisma.notifications.deleteMany({})
      if (deleteNotification) response.status(HttpStatus.OK).json({ message: "All notfications deleted" });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async getimageattachment(query: GetImageAttachment, response: Response) {
    try {
      let attachment = await this.serviceFunction.getAttachments(
        query.attachment_Id,
        query.model_Name
      );
      if (attachment) response.status(HttpStatus.OK).json(attachment.path);
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  // async getNotifications(query: GetNotifications, response: Response) {
  //   try {
  //     console.log("notifications");

  //     query.limit == undefined ? 0 : query?.limit;
  //     let count = await this.prisma.notifications.count({
  //       where: {
  //         user_id: query.user_id ?? undefined,
  //         organization_id: query.organization_id ?? undefined,
  //       },
  //     });
  //     let notifications = await this.prisma.notifications.findMany({
  //       where: {
  //         user_id: query.user_id ?? undefined,
  //         organization_id: query.organization_id ?? undefined,
  //       },
  //       skip: pageNo * limit,
  //       take: query?.limit,
  //     });
  //     if (notifications)
  //       response.status(HttpStatus.OK).json({
  //         total: count,
  //         limit: limit,
  //         offset: pageNo,
  //         data: notifications,
  //       });
  //   } catch (error) {
  //     PrismaException.prototype.findprismaexception(error, response);
  //   }
  // }
}
