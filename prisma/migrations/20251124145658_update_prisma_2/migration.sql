/*
  Warnings:

  - You are about to drop the column `code` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `percent` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `usageLimit` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `usedCount` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `currentUsage` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxUsage` on the `coupon` table. All the data in the column will be lost.
  - Added the required column `text` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `percent` on table `coupon` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Comment_code_key` ON `comment`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `code`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `isActive`,
    DROP COLUMN `maxDiscount`,
    DROP COLUMN `percent`,
    DROP COLUMN `usageLimit`,
    DROP COLUMN `usedCount`,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `text` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `coupon` DROP COLUMN `amount`,
    DROP COLUMN `currentUsage`,
    DROP COLUMN `maxUsage`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `maxDiscount` DOUBLE NULL,
    ADD COLUMN `usageLimit` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `percent` INTEGER NOT NULL;
