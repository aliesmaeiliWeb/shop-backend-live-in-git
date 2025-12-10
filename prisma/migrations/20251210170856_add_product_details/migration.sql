-- AlterTable
ALTER TABLE `Product` ADD COLUMN `amazingExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `enName` VARCHAR(191) NULL,
    ADD COLUMN `specifications` JSON NULL,
    ADD COLUMN `warranty` VARCHAR(191) NULL;
