-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LinkToScrap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "departamentId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "scrapped" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LinkToScrap_departamentId_fkey" FOREIGN KEY ("departamentId") REFERENCES "Departament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LinkToScrap" ("createdAt", "departamentId", "id", "updatedAt", "url") SELECT "createdAt", "departamentId", "id", "updatedAt", "url" FROM "LinkToScrap";
DROP TABLE "LinkToScrap";
ALTER TABLE "new_LinkToScrap" RENAME TO "LinkToScrap";
CREATE UNIQUE INDEX "LinkToScrap_url_key" ON "LinkToScrap"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
