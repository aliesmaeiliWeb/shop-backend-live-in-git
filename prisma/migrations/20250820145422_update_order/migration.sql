/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `customerEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerName` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerPhone` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `pinCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_paymentId_key` ON `Order`(`paymentId`);
