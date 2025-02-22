/*
  Warnings:

  - Added the required column `text` to the `Navbar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Navbar" ADD COLUMN     "text" TEXT NOT NULL;
