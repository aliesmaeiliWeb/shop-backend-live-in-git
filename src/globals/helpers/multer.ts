import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadFileDir = path.join(__dirname, "../../../image", "products");
    cb(null, uploadFileDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

//! for category image upload
const storageCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadFileDir = path.join(__dirname, "../../../image", "category");
    cb(null, uploadFileDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const categoryUpload = multer({ storage: storageCategory });
