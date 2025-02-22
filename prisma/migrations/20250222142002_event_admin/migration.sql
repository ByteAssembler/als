-- CreateTable
CREATE TABLE "Navbar" (
    "id" SERIAL NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "href" TEXT NOT NULL,
    "onLanguageSlug" BOOLEAN NOT NULL,

    CONSTRAINT "Navbar_pkey" PRIMARY KEY ("id")
);
