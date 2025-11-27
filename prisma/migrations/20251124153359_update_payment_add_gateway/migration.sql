/*
  Warnings:

  - Added the required column `gateway` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `gateway` VARCHAR(191) NOT NULL;
