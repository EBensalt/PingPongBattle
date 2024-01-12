/*
  Warnings:

  - You are about to drop the column `sender` on the `Notifications` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "sender",
ADD COLUMN     "senderId" INTEGER NOT NULL;
