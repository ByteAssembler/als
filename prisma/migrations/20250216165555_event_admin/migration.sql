/*
  Warnings:

  - Added the required column `language` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "language" TEXT NOT NULL;
