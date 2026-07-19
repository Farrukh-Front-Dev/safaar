-- AlterTable: Add guest contact columns to bookings
ALTER TABLE "bookings"
  ADD COLUMN "guest_name"  VARCHAR(200),
  ADD COLUMN "guest_email" VARCHAR(255),
  ADD COLUMN "guest_phone" VARCHAR(20);
