-- CreateTable
CREATE TABLE "forgot_password_token" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,

    CONSTRAINT "forgot_password_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_token_userId_key" ON "forgot_password_token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_token_tokenHash_key" ON "forgot_password_token"("tokenHash");

-- AddForeignKey
ALTER TABLE "forgot_password_token" ADD CONSTRAINT "forgot_password_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
