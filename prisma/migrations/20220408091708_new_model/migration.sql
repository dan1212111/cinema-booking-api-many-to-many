/*
  Warnings:

  - You are about to drop the column `seats` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the `_ScreenToSeat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `number` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `screenId` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ScreenToSeat" DROP CONSTRAINT "_ScreenToSeat_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScreenToSeat" DROP CONSTRAINT "_ScreenToSeat_B_fkey";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "seats",
ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "row" TEXT NOT NULL,
ADD COLUMN     "screenId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ScreenToSeat";

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
