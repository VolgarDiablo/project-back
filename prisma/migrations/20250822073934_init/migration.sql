-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "referred_by" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "metaData" JSONB,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invest_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "country_code" TEXT,
    "level1_per" INTEGER NOT NULL DEFAULT 5,
    "level2_per" INTEGER NOT NULL DEFAULT 2,
    "u_level1_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "u_level2_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_referral" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "level1_id" INTEGER,
    "level2_id" INTEGER,

    CONSTRAINT "user_referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."withdraws" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "invoice_id" TEXT,
    "type" TEXT NOT NULL,
    "amount_percent" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "details_first" TEXT NOT NULL,
    "details_second" TEXT NOT NULL,
    "details_third" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdraws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "invoice_id" TEXT,
    "status" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plans" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "percent_daily" DOUBLE PRECISION NOT NULL,
    "term_days" INTEGER NOT NULL,
    "min_deposit" INTEGER NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_plans" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."earns" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_affiliate_id_key" ON "public"."users"("affiliate_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_referral_user_id_key" ON "public"."user_referral"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_plans_order_id_key" ON "public"."order_plans"("order_id");

-- AddForeignKey
ALTER TABLE "public"."user_referral" ADD CONSTRAINT "user_referral_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_referral" ADD CONSTRAINT "user_referral_level1_id_fkey" FOREIGN KEY ("level1_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_referral" ADD CONSTRAINT "user_referral_level2_id_fkey" FOREIGN KEY ("level2_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."withdraws" ADD CONSTRAINT "withdraws_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_plans" ADD CONSTRAINT "order_plans_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_plans" ADD CONSTRAINT "order_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."earns" ADD CONSTRAINT "earns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."earns" ADD CONSTRAINT "earns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
