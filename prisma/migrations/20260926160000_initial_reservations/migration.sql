-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('WEBSITE', 'PHONE', 'PRIVATE', 'WALK_IN', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('MANAGER', 'STAFF');

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "blockedUntil" TIMESTAMPTZ(6) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "bookingSource" "BookingSource" NOT NULL DEFAULT 'WEBSITE',
    "guestNotes" TEXT,
    "staffNotes" TEXT,
    "createdByUserId" TEXT,
    "cancelledAt" TIMESTAMPTZ(6),
    "cancellationReason" TEXT,
    "cancelledByUserId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastLoginAt" TIMESTAMPTZ(6),
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "reservationId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_referenceCode_key" ON "Reservation"("referenceCode");
CREATE INDEX "Reservation_startsAt_idx" ON "Reservation"("startsAt");
CREATE INDEX "Reservation_status_startsAt_idx" ON "Reservation"("status", "startsAt");
CREATE INDEX "Reservation_email_idx" ON "Reservation"("email");
CREATE INDEX "Reservation_phone_idx" ON "Reservation"("phone");
CREATE INDEX "Reservation_guestName_idx" ON "Reservation"("guestName");
CREATE UNIQUE INDEX "AvailabilityBlock_startsAt_endsAt_reason_key" ON "AvailabilityBlock"("startsAt", "endsAt", "reason");
CREATE INDEX "AvailabilityBlock_startsAt_endsAt_idx" ON "AvailabilityBlock"("startsAt", "endsAt");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminAuditLog_adminUserId_createdAt_idx" ON "AdminAuditLog"("adminUserId", "createdAt");
CREATE INDEX "AdminAuditLog_reservationId_createdAt_idx" ON "AdminAuditLog"("reservationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A single venue cannot accept two active reservations whose occupied windows overlap.
-- `blockedUntil` includes the mandatory 90-minute turnover period after each party.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_active_time_window_exclusion"
  EXCLUDE USING GIST (
    tstzrange("startsAt", "blockedUntil", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));
