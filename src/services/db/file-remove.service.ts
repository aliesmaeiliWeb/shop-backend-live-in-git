import path from "path";
import fs from "fs/promises";

class FileRemoveService {
  public async deleteFileRemoveImage(filename: string): Promise<void> {
    if (!filename) {
      console.warn("attempted to delete a file with no name.");
      return;
    }

    try {
      const filePath = path.join(__dirname, "/image/products", filename);

      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code === "ENONT") {
        console.warn(`failed not found, could not delete: ${filename}`);
      } else {
        console.error("error deleteing file from disk:", err);
      }
    }
  }
}

export const fileRemoveService: FileRemoveService = new FileRemoveService();
