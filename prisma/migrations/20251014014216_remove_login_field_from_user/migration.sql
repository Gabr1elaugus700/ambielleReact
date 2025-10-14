/*
  Warnings:

  - You are about to drop the column `login` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_login_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "login";
