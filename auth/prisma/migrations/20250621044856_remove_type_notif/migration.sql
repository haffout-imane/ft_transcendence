/*
  Warnings:

  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Notification` table. All the data in the column will be lost.
  - Made the column `message` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "read",
DROP COLUMN "type",
ALTER COLUMN "message" SET NOT NULL;

-- DropEnum
DROP TYPE "NotificationType";
