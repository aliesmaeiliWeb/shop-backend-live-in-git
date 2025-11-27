import fs from "fs/promises";
import path from "path";

class FileRemoveService {
  /**
   * @description یک فایل را از فولدر آپلود مشخص شده حذف می‌کند.
   * @param filename نام فایلی که باید حذف شود.
   * @param folder نام فولدری که فایل در آن قرار دارد (مثلاً 'products' یا 'banners').
   */
  public async deleteUpload(
    filename: string,
    folder: "products" | "banners"
  ): Promise<void> {
    if (!filename) {
      console.warn("Attempted to delete a file with no name.");
      return;
    }

    const filePath = path.join(process.cwd(), 'image', folder, filename);
    console.log("مسیر ساخته شده برای حذف فایل:", filePath);

    try {
      // ✅ ۱. ساخت مسیر کامل و صحیح فایل از ریشه پروژه
      const filePath = path.join(process.cwd(), "uploads", folder, filename);

      // ۲. حذف فایل با استفاده از مسیر صحیح
      await fs.unlink(filePath);

      console.log(
        `File ${filename} from folder ${folder} was successfully deleted.`
      );
    } catch (error: any) {
      // ✅ ۳. اصلاح اشتباه تایپی در کد خطا
      if (error.code === "ENOENT") {
        // ENOENT: Error NO ENTity (file not found)
        console.warn(`File not found, could not delete: ${filename}`);
      } else {
        console.error(`Error deleting file from disk:`, error);
      }
    }
  }
}

export const fileRemoveService: FileRemoveService = new FileRemoveService();
