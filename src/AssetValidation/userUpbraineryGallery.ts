import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const UserUpbraineryGallery = FileFieldsInterceptor(
    [
        { name: "Files", maxCount: 10 },
    ],
    {
        dest: "./public/usergallery",
        limits: {
            fileSize: 50000000,
        },
        storage: diskStorage({
            destination: "./public/usergallery",
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const filename = `${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
    }
);
