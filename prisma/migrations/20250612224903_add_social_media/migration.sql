-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "whatsappNumber" TEXT,
ADD COLUMN     "xUrl" TEXT;

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "facebookHandle" TEXT,
    "tiktokHandle" TEXT,
    "xHandle" TEXT,
    "bio" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_userId_key" ON "SocialMedia"("userId");

-- CreateIndex
CREATE INDEX "SocialMedia_userId_idx" ON "SocialMedia"("userId");

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
