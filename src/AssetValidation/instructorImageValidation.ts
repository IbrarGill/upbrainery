import { HttpException, HttpStatus } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const InstructorImageValidation = FileFieldsInterceptor(
  [
    { name: "avator", maxCount: 1 },
    { name: "activityPhoto", maxCount: 1 },
    { name: "blockImage", maxCount: 20 },
    { name: "coursePhoto", maxCount: 1 },
    { name: "sessionPhoto", maxCount: 1 },
    { name: "ActivityResource", maxCount: 20 },
    { name: "InstructorLicenseFront", maxCount: 1 },
    { name: "InstructorLicenseBack", maxCount: 1 },
    { name: "InstructorResume", maxCount: 1 },
    { name: "BadgeImage", maxCount: 1 },
    { name: 'OrganizationLogo', maxCount: 1 }
  ],

  {
    dest: "./public/tempfolder",
    limits: {
      fileSize: 5000000,
    },
    fileFilter: (req: any, file: any, cb: any) => {

      const allowedFileTypes = ["jpg", "jpeg", "png", "gif", "pdf", "plain", "vnd.openxmlformats-officedocument.wordprocessingml.document", "vnd.ms-pki.stl", "glb", "usdz", "gltf", "mp4", "mov", "avi", "wmv", "svg", "svg+xml", "SVGZ"];

      const fileExtension = file.mimetype.split("/")[1]; // Extract file extension from mimetype

      if (allowedFileTypes.includes(fileExtension)) {
        // File type is supported
        // Proceed with further actions
        cb(null, true);
      } else {
        // File type is not supported
        // Return error response or handle accordingly
        cb(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST
          ),
          false
        );
      }

      // if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|plain|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-pki\.stl|glb|usdz|gltf|mp4|mov|avi|wmv|svg|svg+xml|SVGZ)$/)) {
      //   // Allow storage of file

      // } else {
      //   // Reject file

      // }
    },
    storage: diskStorage({
      destination: "./public/tempfolder",
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }
);
