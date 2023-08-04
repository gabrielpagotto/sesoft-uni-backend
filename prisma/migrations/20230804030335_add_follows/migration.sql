-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "likes_count" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "follows" (
    "user_followed_id" TEXT NOT NULL,
    "user_following_id" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("user_followed_id","user_following_id")
);

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_followed_id_fkey" FOREIGN KEY ("user_followed_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_following_id_fkey" FOREIGN KEY ("user_following_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
