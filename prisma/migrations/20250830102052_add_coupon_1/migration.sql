/*
  Warnings:

  - You are about to drop the column `expirestAt` on the `coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `coupon` DROP COLUMN `expirestAt`,
    ADD COLUMN `expiresAt` DATETIME(3) NULL;
