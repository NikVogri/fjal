-- CreateTable
CREATE TABLE "Text" (
    "id" TEXT NOT NULL,
    "text" VARCHAR(2560) NOT NULL,
    "length" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Text_id_key" ON "Text"("id");
