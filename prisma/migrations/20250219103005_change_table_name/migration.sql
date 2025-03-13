/*
  Warnings:

  - You are about to drop the `BusinessDirectory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BusinessDirectory";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "businessDirectory" (
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
    "userId" BIGINT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
