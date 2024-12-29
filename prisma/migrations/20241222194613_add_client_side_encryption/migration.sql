-- AlterTable
ALTER TABLE "Text" ADD COLUMN     "clientSideEncryption" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "iv" DROP NOT NULL;
