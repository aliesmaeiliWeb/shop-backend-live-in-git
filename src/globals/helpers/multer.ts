import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Utility to ensure the directory exists.
 * If not, it creates it recursively.
 */
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// --- 1. PRODUCT STORAGE CONFIGURATION ---
const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    // We store images in root/image/products
    const uploadPath = path.join(process.cwd(), "image", "products");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: Timestamp + Random Number + Safe Original Name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// --- 2. CATEGORY STORAGE CONFIGURATION ---
const storageCategory = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "image", "category");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// --- 3. BANNER STORAGE CONFIGURATION ---
const storageBanner = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "image", "banners");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// update avatar
const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "image", "avatar");
    // Ensure folder exists (use the helper function we made)
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

// --- EXPORTS ---
export const productUpload = multer({ storage: storageProduct });
export const categoryUpload = multer({ storage: storageCategory });
export const bannerUpload = multer({ storage: storageBanner });
export const uploadAvatar = multer({ storage: storageAvatar });