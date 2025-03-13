/*
  Warnings:

  - Added the required column `categoryId` to the `BusinessDirectory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessDirectory" (
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
INSERT INTO "new_BusinessDirectory" ("Instructor", "address", "email", "expertise", "id", "link", "listingTitle", "phone", "tags", "url", "userId", "zip") SELECT "Instructor", "address", "email", "expertise", "id", "link", "listingTitle", "phone", "tags", "url", "userId", "zip" FROM "BusinessDirectory";
DROP TABLE "BusinessDirectory";
ALTER TABLE "new_BusinessDirectory" RENAME TO "BusinessDirectory";
CREATE TABLE "new_Categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryName" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Categories" ("categoryName", "categorySlug", "id") SELECT "categoryName", "categorySlug", "id" FROM "Categories";
DROP TABLE "Categories";
ALTER TABLE "new_Categories" RENAME TO "Categories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
