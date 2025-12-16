import fs from "fs/promises";
import path from "path";

class FileRemoveService {
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
      const filePath = path.join(process.cwd(), "uploads", folder, filename);

      await fs.unlink(filePath);

      console.log(
        `File ${filename} from folder ${folder} was successfully deleted.`
      );
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.warn(`File not found, could not delete: ${filename}`);
      } else {
        console.error(`Error deleting file from disk:`, error);
      }
    }
  }
}

export const fileRemoveService: FileRemoveService = new FileRemoveService();
