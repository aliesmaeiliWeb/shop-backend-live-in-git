/*
  Warnings:

  - You are about to drop the column `variant` on the `cartitem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `product` table. All the data in the column will be lost.
  - You are about to drop the `productvariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productvariantitems` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cartId,productSKUId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productSKUId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productvariant` DROP FOREIGN KEY `ProductVariant_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productvariantitems` DROP FOREIGN KEY `ProductVariantItems_variantId_fkey`;

-- AlterTable
ALTER TABLE `cartitem` DROP COLUMN `variant`,
    ADD COLUMN `productSKUId` INTEGER NOT NULL,
    MODIFY `productId` INTEGER NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `quantity`;

-- DropTable
DROP TABLE `productvariant`;

-- DropTable
DROP TABLE `productvariantitems`;

-- CreateTable
CREATE TABLE `ProductSKU` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    UNIQUE INDEX `ProductSKU_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_cartId_productSKUId_key` ON `CartItem`(`cartId`, `productSKUId`);

-- AddForeignKey
ALTER TABLE `ProductSKU` ADD CONSTRAINT `ProductSKU_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productSKUId_fkey` FOREIGN KEY (`productSKUId`) REFERENCES `ProductSKU`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
