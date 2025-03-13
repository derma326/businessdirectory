/*
  Warnings:

  - You are about to alter the column `categoryId` on the `businessDirectory` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_businessDirectory" (
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
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "businessDirectory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_businessDirectory" ("Instructor", "address", "categoryId", "createdAt", "email", "expertise", "id", "link", "listingTitle", "phone", "tags", "url", "userId", "zip") SELECT "Instructor", "address", "categoryId", "createdAt", "email", "expertise", "id", "link", "listingTitle", "phone", "tags", "url", "userId", "zip" FROM "businessDirectory";
DROP TABLE "businessDirectory";
ALTER TABLE "new_businessDirectory" RENAME TO "businessDirectory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
