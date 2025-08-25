import multer from "multer";
import path from "path";
import fs from "node:fs";

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

function createStorage(uploadDir: string) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "../../../image", "avatar");

      //+ if folder dose not exist
      if (!fs.existsSync(uploadPath)) {
        //+craete folder uplodDir name
        fs.mkdirSync(uploadPath);
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  return storage;
}

export const categoryUpload = multer({ storage: storageCategory });
export const uploadAvatar = multer({ storage: createStorage("users") });
