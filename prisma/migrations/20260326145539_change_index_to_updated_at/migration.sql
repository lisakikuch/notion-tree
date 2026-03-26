-- DropIndex
DROP INDEX `interest_user_lastAccessedAt_id_idx` ON `interest`;

-- CreateIndex
CREATE INDEX `interest_user_updatedAt_id_idx` ON `Interest`(`userId`, `updatedAt`, `id`);
