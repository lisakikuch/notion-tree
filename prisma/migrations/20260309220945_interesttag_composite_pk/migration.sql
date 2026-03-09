-- DropForeignKey
ALTER TABLE `interesttag` DROP FOREIGN KEY `InterestTag_interestId_fkey`;

-- AlterTable
ALTER TABLE `interesttag` ADD PRIMARY KEY (`interestId`, `tagId`);

-- DropIndex
DROP INDEX `interestTag_interest_tag_uq` ON `interesttag`;

-- AddForeignKey
ALTER TABLE `InterestTag` ADD CONSTRAINT `InterestTag_interestId_fkey` FOREIGN KEY (`interestId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
