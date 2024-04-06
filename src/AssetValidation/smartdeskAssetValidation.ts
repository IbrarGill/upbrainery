import { HttpException, HttpStatus } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const SmartDeskAssetValidation = FileFieldsInterceptor(
  [
    { name: "smartdesk_attachment", maxCount: 1 }
  ],

  {
    dest: "./public/smartdesk",
    limits: {
      fileSize: 5000000,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|plain|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/)) {
        // Allow storage of file
        cb(null, true);
      } else {
        // Reject file
        cb(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST
          ),
          false
        );
      }
    },
    storage: diskStorage({
      destination: "./public/smartdesk",
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }
);
