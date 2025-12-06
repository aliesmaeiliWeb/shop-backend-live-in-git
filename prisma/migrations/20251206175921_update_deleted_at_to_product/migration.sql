/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ProductSKU` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `deletedAt`;

-- AlterTable
ALTER TABLE `ProductSKU` DROP COLUMN `deletedAt`,
    ADD COLUMN `deleteAt` DATETIME(3) NULL;
