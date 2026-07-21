-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEAM_LEADER', 'TEAM_MEMBER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('no_answer', 'not_home', 'at_home');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "settlement" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" SERIAL NOT NULL,
    "address" INTEGER NOT NULL,
    "contacts" JSONB NOT NULL,
    "totalResidents" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "specialNeeds" TEXT,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusUpdate" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL,
    "currentAtHome" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Household_address_key" ON "Household"("address");
