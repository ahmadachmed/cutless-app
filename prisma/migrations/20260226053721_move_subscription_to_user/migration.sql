/*
  Warnings:

  - You are about to drop the column `subscriptionEndDate` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStartDate` on the `Barbershop` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Barbershop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "openTime" TEXT DEFAULT '09:00',
    "closeTime" TEXT DEFAULT '21:00',
    "breakStartTime" TEXT,
    "breakEndTime" TEXT,
    "daysOpen" TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Barbershop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Barbershop" ("address", "breakEndTime", "breakStartTime", "closeTime", "createdAt", "daysOpen", "deletedAt", "id", "name", "openTime", "ownerId", "phoneNumber", "updatedAt") SELECT "address", "breakEndTime", "breakStartTime", "closeTime", "createdAt", "daysOpen", "deletedAt", "id", "name", "openTime", "ownerId", "phoneNumber", "updatedAt" FROM "Barbershop";
DROP TABLE "Barbershop";
ALTER TABLE "new_Barbershop" RENAME TO "Barbershop";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStartDate" DATETIME,
    "subscriptionEndDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
