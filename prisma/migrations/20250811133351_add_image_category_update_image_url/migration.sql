/*
  Warnings:

  - You are about to drop the column `main_Image` on the `category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `main_Image`,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;
