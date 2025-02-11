-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionContent" (
    "id" TEXT NOT NULL,
    "langCode" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "SectionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SectionContents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SectionContents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionContent_sectionId_langCode_key" ON "SectionContent"("sectionId", "langCode");

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE INDEX "_SectionContents_B_index" ON "_SectionContents"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionContent" ADD CONSTRAINT "SectionContent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionContents" ADD CONSTRAINT "_SectionContents_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionContents" ADD CONSTRAINT "_SectionContents_B_fkey" FOREIGN KEY ("B") REFERENCES "SectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
