/*
  Warnings:

  - You are about to drop the column `image_large` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image_small` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image_xlarge` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "image_large",
DROP COLUMN "image_small",
DROP COLUMN "image_xlarge";
