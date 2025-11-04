// middlewares/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only JPG, PNG, and WebP allowed."));
    }
    cb(null, true);
};

const makeUploader = (folder, maxFiles) =>
    multer({
        storage: new CloudinaryStorage({
            cloudinary,
            params: {
                folder,
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
                resource_type: "image",
            },
        }),
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024, files: maxFiles },
    });

export const uploadBlogImage = makeUploader("blogs", 1);
