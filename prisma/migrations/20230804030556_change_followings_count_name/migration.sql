/*
  Warnings:

  - You are about to drop the column `following_count` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "following_count",
ADD COLUMN     "followings_count" INTEGER NOT NULL DEFAULT 0;
