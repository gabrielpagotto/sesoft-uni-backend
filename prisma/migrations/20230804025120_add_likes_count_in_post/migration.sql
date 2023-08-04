/*
  Warnings:

  - Added the required column `likes_count` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "likes_count" INTEGER NOT NULL;
