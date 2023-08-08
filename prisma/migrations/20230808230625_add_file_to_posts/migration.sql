/*
  Warnings:

  - Added the required column `post_id` to the `storage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "storage" ADD COLUMN     "post_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "storage" ADD CONSTRAINT "storage_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
