-- CreateTable
CREATE TABLE "BusinessDirectory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingTitle" TEXT NOT NULL,
    "Instructor" TEXT,
    "expertise" TEXT NOT NULL,
    "url" TEXT,
    "link" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "tags" TEXT,
    "address" TEXT,
    "zip" TEXT,
    "userId" BIGINT NOT NULL
);
