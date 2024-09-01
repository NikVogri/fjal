-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
