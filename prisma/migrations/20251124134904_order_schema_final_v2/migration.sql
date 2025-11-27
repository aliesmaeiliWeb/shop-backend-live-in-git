/*
  Warnings:

  - You are about to drop the column `isApproved` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `order` table. All the data in the column will be lost.
  - The values [PAYMENT_PENDING,REFUNDED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `priceAtPurchase` on the `orderitem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percent` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressJson` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productSKUId_fkey`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `isApproved`,
    DROP COLUMN `rating`,
    DROP COLUMN `text`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `maxDiscount` DOUBLE NULL,
    ADD COLUMN `percent` INTEGER NOT NULL,
    ADD COLUMN `usageLimit` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `shippingAddress`,
    ADD COLUMN `addressJson` TEXT NOT NULL,
    ADD COLUMN `couponCode` VARCHAR(191) NULL,
    ADD COLUMN `note` TEXT NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `priceAtPurchase`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    MODIFY `productSKUId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Comment_code_key` ON `Comment`(`code`);

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productSKUId_fkey` FOREIGN KEY (`productSKUId`) REFERENCES `ProductSKU`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
