import { HttpException, HttpStatus, Injectable, Param } from "@nestjs/common";
import { PrismaException } from "src/prisma/prismaException/prismaException";
import { Request, Response, query } from "express";
import { PrismaService } from "src/prisma/prisma.client";
import { CommonFunctionsService } from "src/services/commonService";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AR3dModelDto, CreateUserGalleryDto, QueryUserGalleryDto } from "./dto/create-shared-api.dto";
@Injectable()
export class SharedApiService {
  constructor(
    private prisma: PrismaService,
    private serviceFunction: CommonFunctionsService,
    private eventEmitter: EventEmitter2
  ) { }
  uploadtogallery(files: Express.Multer.File, dto: CreateUserGalleryDto, response: Response) {
    try {

      let images: any = files;
      if (images.Files) {

        for (let index = 0; index < images.Files.length; index++) {
          const file = images.Files[index];
          let eventData = {
            userId: dto.userId,
            organizationId: dto.organizationId,
            availabilityId: dto.availabilityId,
            filetypeId: dto.attachmenttypeId,
            path: `${file.destination}/${file.filename}`,
            fileName: file.originalname
          };
          this.eventEmitter.emit("event.usergallery", eventData);
        }
      }
      return response.status(HttpStatus.OK).json({
        message: "Files Uploaded Successfully!!"
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
  async getmygallery(query: QueryUserGalleryDto, response: Response) {
    try {

      let pageNo: number | undefined =
        query.pageNo == undefined ? 0 : query?.pageNo;
      let limit: number | undefined =
        query.limit == undefined ? 0 : query?.limit;

      let count = await this.prisma.attachments.count({
        where: {
          is_active: true,
          user_id: query?.userId ?? undefined,
          organization_id: query?.organizationId ?? undefined,
          availability_id: query?.availabilityId ?? undefined,
          attachment_type_id: query?.attachmenttypeId ?? undefined,
          field_name: {
            contains: query?.searchByText?.toString() ?? undefined
          }
        }
      })

      let attachments: any = await this.prisma.attachments.findMany({
        where: {
          is_active: true,
          user_id: query?.userId ?? undefined,
          organization_id: query?.organizationId ?? undefined,
          availability_id: query?.availabilityId ?? undefined,
          attachment_type_id: query?.attachmenttypeId ?? undefined,
          field_name: {
            contains: query?.searchByText?.toString() ?? undefined
          }
        },
        orderBy: [
          query.orderBy === "Latest Attachments" ? {
            id: "desc",
          } : null,
          query.orderBy === "Oldest Attachments" ? {
            id: "asc"
          } : null,
        ],
        skip: pageNo * limit,
        take: query?.limit,
        select: {
          id: true,
          Image_key: true,
          field_name: true,
          path: true,
          attachment_types: true,
        }
      })


      if (attachments) {
        for (const item of attachments) {
          let imageUrl = await this.serviceFunction.getGalleryAttachments(
            item.Image_key
          );
          item.imageUrl = imageUrl
        }


        response.status(HttpStatus.OK).json({
          total: count,
          limit: limit,
          offset: pageNo,
          data: attachments,
        });
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }

  async getallattachmenttypes(response: Response) {
    try {


      let attachments: any = await this.prisma.attachment_types.findMany({
        select: {
          id: true,
          name: true,
        }
      })

      if (attachments) {
        response.status(HttpStatus.OK).json(attachments);
      }

    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }


  async upload3dmodel(files: Express.Multer.File, dto: AR3dModelDto, response: Response) {
    try {

      let images: any = files;
      if (images.ARModel3D) {
        for (let index = 0; index < images.ARModel3D.length; index++) {
          const file = images.ARModel3D[index];
          let ar3dmodel = await this.prisma.augmented_3d_models.create({
            data: {
              file_name: file.originalname,
              organization_id: dto.organizationId,
              user_id: dto.userId
            }
          })

          dto.attachmenttoARList.map(async (item, index) => {
            await this.prisma.augmented_3d_model_attachments.create({
              data: {
                attachment_id: item.attachmentId,
                augmented_3d_model_id: ar3dmodel.id
              }
            })
          })

          let eventData = {
            attachmentable_id: ar3dmodel.id,
            organizationId: dto.organizationId,
            path: `${file.destination}/${file.filename}`,
            fileName: file.originalname
          };
          this.eventEmitter.emit("event.ARModel3D", eventData);
        }
      }
      return response.status(HttpStatus.OK).json({
        message: "3D Uploaded Successfully!!"
      });
    } catch (error) {
      PrismaException.prototype.findprismaexception(error, response);
    }
  }
}
