-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN "breakEndTime" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN "breakStartTime" TEXT;
ALTER TABLE "Barbershop" ADD COLUMN "closeTime" TEXT DEFAULT '21:00';
ALTER TABLE "Barbershop" ADD COLUMN "daysOpen" TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat';
ALTER TABLE "Barbershop" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Barbershop" ADD COLUMN "openTime" TEXT DEFAULT '09:00';

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "capsterId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_capsterId_fkey" FOREIGN KEY ("capsterId") REFERENCES "Capster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
