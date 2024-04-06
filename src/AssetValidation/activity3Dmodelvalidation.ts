import { HttpException, HttpStatus } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const ActivityAnd3Dmodelvalidation = FileFieldsInterceptor(
    [
        { name: "activityPhoto", maxCount: 1 },
        { name: "blockImage", maxCount: 20 },
        { name: "blockVideo", maxCount: 20 },
        { name: "Model3D", maxCount: 5 },
        { name: "coursePhoto", maxCount: 1 },
        { name: "ActivityResource", maxCount: 20 },
    ],
    {
        dest: "./public/interactives/images",
        limits: {
            fileSize: 50000000,
        },
        storage: diskStorage({
            destination: "./public/interactives/images",
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const filename = `${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
    }
);
