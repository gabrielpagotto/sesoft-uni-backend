-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon_storage_id" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_id_key" ON "profile"("id");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_icon_storage_id_fkey" FOREIGN KEY ("icon_storage_id") REFERENCES "storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
