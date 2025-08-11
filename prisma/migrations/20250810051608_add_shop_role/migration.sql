-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('User', 'Admin', 'Shop') NOT NULL DEFAULT 'Admin';
