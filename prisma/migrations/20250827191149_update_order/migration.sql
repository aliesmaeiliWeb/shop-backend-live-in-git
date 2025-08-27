/*
  Warnings:

  - You are about to drop the column `paymentId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `pinCode` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `orderitems` table. All the data in the column will be lost.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSKUId` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `orderItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderitems` DROP FOREIGN KEY `orderItems_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitems` DROP FOREIGN KEY `orderItems_productId_fkey`;

-- DropIndex
DROP INDEX `Order_paymentId_key` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `paymentId`,
    DROP COLUMN `pinCode`,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `shippingCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DOUBLE NOT NULL,
    ADD COLUMN `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `trackingCode` VARCHAR(191) NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PROCESSING', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    MODIFY `shippingAddress` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `orderitems` DROP COLUMN `productId`,
    ADD COLUMN `productSKUId` INTEGER NOT NULL,
    ADD COLUMN `sku` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `gateway` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `orderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_productSKUId_fkey` FOREIGN KEY (`productSKUId`) REFERENCES `ProductSKU`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
