/*
  Warnings:

  - Added the required column `iv` to the `Text` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Text" ADD COLUMN     "iv" VARCHAR(255) NOT NULL;
