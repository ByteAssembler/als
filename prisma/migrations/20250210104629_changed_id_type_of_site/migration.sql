/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Section` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SectionContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SectionContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_SectionContents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `js` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `siteId` on the `Section` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sectionId` on the `SectionContent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_SectionContents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_SectionContents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_siteId_fkey";

-- DropForeignKey
ALTER TABLE "SectionContent" DROP CONSTRAINT "SectionContent_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "_SectionContents" DROP CONSTRAINT "_SectionContents_A_fkey";

-- DropForeignKey
ALTER TABLE "_SectionContents" DROP CONSTRAINT "_SectionContents_B_fkey";

-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
ADD COLUMN     "js" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "siteId",
ADD COLUMN     "siteId" INTEGER NOT NULL,
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SectionContent" DROP CONSTRAINT "SectionContent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sectionId",
ADD COLUMN     "sectionId" INTEGER NOT NULL,
ADD CONSTRAINT "SectionContent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Site_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_SectionContents" DROP CONSTRAINT "_SectionContents_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_SectionContents_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateTable
CREATE TABLE "InfoEntry" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoEntryLanguageRelatedContent" (
    "id" SERIAL NOT NULL,
    "langCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "infoEntryId" INTEGER NOT NULL,

    CONSTRAINT "InfoEntryLanguageRelatedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoEntry_slug_key" ON "InfoEntry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "InfoEntryLanguageRelatedContent_langCode_key" ON "InfoEntryLanguageRelatedContent"("langCode");

-- CreateIndex
CREATE UNIQUE INDEX "InfoEntryLanguageRelatedContent_langCode_id_key" ON "InfoEntryLanguageRelatedContent"("langCode", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SectionContent_sectionId_langCode_key" ON "SectionContent"("sectionId", "langCode");

-- CreateIndex
CREATE INDEX "_SectionContents_B_index" ON "_SectionContents"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionContent" ADD CONSTRAINT "SectionContent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoEntryLanguageRelatedContent" ADD CONSTRAINT "InfoEntryLanguageRelatedContent_infoEntryId_fkey" FOREIGN KEY ("infoEntryId") REFERENCES "InfoEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionContents" ADD CONSTRAINT "_SectionContents_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionContents" ADD CONSTRAINT "_SectionContents_B_fkey" FOREIGN KEY ("B") REFERENCES "SectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
