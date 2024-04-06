
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const AR3Dmodelvalidation = FileFieldsInterceptor(
    [
        { name: "ARModel3D", maxCount: 10 },
    ],
    {
        dest: "./public/augmented3dmodel",
        limits: {
            fileSize: 50000000,
        },
        storage: diskStorage({
            destination: "./public/augmented3dmodel",
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const filename = `${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
    }
);
