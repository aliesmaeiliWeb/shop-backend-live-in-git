/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `imageUrl`,
    ADD COLUMN `main_Image` VARCHAR(191) NULL;
