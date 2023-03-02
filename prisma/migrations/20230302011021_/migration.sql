/*
  Warnings:

  - You are about to drop the column `amazonURL` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "breadCrumbCategoryId" INTEGER NOT NULL,
    "amazonID" TEXT NOT NULL,
    CONSTRAINT "Product_breadCrumbCategoryId_fkey" FOREIGN KEY ("breadCrumbCategoryId") REFERENCES "BreadCrumbCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("amazonID", "breadCrumbCategoryId", "createdAt", "description", "id", "name", "updatedAt") SELECT "amazonID", "breadCrumbCategoryId", "createdAt", "description", "id", "name", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
