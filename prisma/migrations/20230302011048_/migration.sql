/*
  Warnings:

  - You are about to drop the column `amazonID` on the `Product` table. All the data in the column will be lost.
  - Added the required column `amazonURL` to the `Product` table without a default value. This is not possible if the table is not empty.

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
    "amazonURL" TEXT NOT NULL,
    CONSTRAINT "Product_breadCrumbCategoryId_fkey" FOREIGN KEY ("breadCrumbCategoryId") REFERENCES "BreadCrumbCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("breadCrumbCategoryId", "createdAt", "description", "id", "name", "updatedAt") SELECT "breadCrumbCategoryId", "createdAt", "description", "id", "name", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
