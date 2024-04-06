import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.client";
import fs from "fs";
import { S3BucketService } from "./s3_bucket_service";
@Injectable()
export class CommonFunctionsService {
  constructor(private prisma: PrismaService) { }
  private readonly s3 = new S3BucketService();
  removeImagefromPath(filePath: string) {
    const newPath = filePath.replace(/\//g, '\\');
    if (!fs.existsSync(filePath)) {
      console.log(`File doesn't exist at path: ${newPath}`);
      return; // Exit the function if the file doesn't exist
    }
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("error", err);
        return;
      }

      console.log(`${filePath} has been deleted`);
    });

  }

  async saveAttachments(
    modelId: number,
    image_key: string,
    path_url: string,
    modelName: string,
    filetype: string = "Image",
    fileName: string,
    userId?: number
  ) {
    try {

      let attachment_type = await this.prisma.attachment_types.findUnique({
        where: {
          name: filetype,
        },
      });

      await this.prisma.attachments.create({
        data: {
          attachment_type_id: attachment_type.id,
          Image_key: image_key,
          path: path_url,
          field_name: fileName,
          attachmentable_id: modelId,
          attachmentable_type: modelName,
          user_id: userId
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateAttachments(
    modelId: number,
    _imagePAth: string,
    modelName: string,
    fileType: string = "Image",
    fileName: string
  ) {
    try {
      let attachment = await this.prisma.attachments.findFirst({
        where: {
          attachmentable_id: modelId,
          attachmentable_type: modelName,
        },
      });

      if (attachment) {
        await this.prisma.attachments.update({
          where: {
            id: attachment.id,
          },
          data: {
            path: _imagePAth,
            field_name: modelName,
            Image_key: _imagePAth,
            attachmentable_id: modelId,
            attachmentable_type: modelName,
          },
        });
      } else {
        this.saveAttachments(
          modelId,
          _imagePAth,
          "",
          modelName,
          fileType,
          fileName,
          null
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAttachments(modelId: number, modelName: string) {
    let attachment = await this.prisma.attachments.findFirst({
      where: {
        attachmentable_id: modelId,
        attachmentable_type: modelName,
      },
      select: {
        id: true,
        attachmentable_id: true,
        field_name: true,
        Image_key: true,
        attachment_types: {
          select: {
            id: true,
            name: true,
          },
        },
        path: true,
      },
    });
    if (attachment?.Image_key) {
      let imageUrl = await this.s3.getsignUrl(attachment?.Image_key);
      attachment.path = imageUrl;
      attachment.Image_key;
      return attachment;
    } else {
      return null;
    }
  }


  async getmultipleAttachments(modelId: number, modelName: string) {
    let attachments: any = await this.prisma.attachments.findMany({
      where: {
        attachmentable_id: modelId,
        attachmentable_type: modelName,
      },
      select: {
        id: true,
        attachmentable_id: true,
        field_name: true,
        Image_key: true,
        path: true,
        attachment_types: {
          select: {
            id: true,
            name: true,
          },
        },
        augmented_3d_model_attachments: {
          select: {
            augmented_3d_models: {
              select: {
                id: true,
                qr_code: true,
                file_name: true,
              }
            }
          }
        }
      },
    });
    attachments.map(async (item, index) => {
      if (item?.Image_key) {
        let imageUrl = await this.s3.getsignUrl(item?.Image_key);
        item.path = imageUrl;
        item.armodelUrl = null
        delete item.Image_key;
        return item;
      } else {
        return null;
      }
    });
    return attachments;
  }

  async deleteAttachment(modelId: number, modelName: string) {
    let attachment = await this.prisma.attachments.findFirst({
      where: {
        attachmentable_id: modelId,
        attachmentable_type: modelName,
      },
    });

    await this.prisma.attachments.delete({
      where: {
        id: attachment.id,
      },
    });
  }


  async getGalleryAttachments(key: string) {

    let imageUrl = await this.s3.getsignUrl(key);
    if (imageUrl) {
      return imageUrl;
    } else {
      return null;
    }

  }

}
