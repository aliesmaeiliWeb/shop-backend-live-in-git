-- AlterTable
ALTER TABLE `ProductPriceHistory` ADD COLUMN `skuId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ProductPriceHistory` ADD CONSTRAINT `ProductPriceHistory_skuId_fkey` FOREIGN KEY (`skuId`) REFERENCES `ProductSKU`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
