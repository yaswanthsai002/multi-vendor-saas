CREATE TYPE "public"."order_cancellation_reason" AS ENUM('OUT_OF_STOCK', 'QUALITY_ISSUE', 'LISTING_ERROR', 'OPERATIONAL_ISSUE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."order_cancellation_source" AS ENUM('customer', 'vendor');--> statement-breakpoint
ALTER TABLE "vendorOrders" RENAME COLUMN "cancellationReason" TO "cancellationDetails";--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "cancellationSource" "order_cancellation_source";--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "cancellationReasonCode" "order_cancellation_reason";--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "cancelledByUserId" uuid;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "cancelledAt" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "cancellationReturnedQuantity" integer;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "cancellationDamagedQuantity" integer;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "cancellationMissingQuantity" integer;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD CONSTRAINT "vendorOrders_cancelledByUserId_users_userId_fk" FOREIGN KEY ("cancelledByUserId") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD CONSTRAINT "vendor_orders_cancellation_state_check" CHECK (
      ("vendorOrders"."status" <> 'cancelled' AND "vendorOrders"."cancellationSource" IS NULL AND "vendorOrders"."cancelledByUserId" IS NULL AND "vendorOrders"."cancelledAt" IS NULL AND "vendorOrders"."cancellationReasonCode" IS NULL AND "vendorOrders"."cancellationDetails" IS NULL)
      OR ("vendorOrders"."status" = 'cancelled' AND "vendorOrders"."cancellationSource" IS NOT NULL AND "vendorOrders"."cancelledByUserId" IS NOT NULL AND "vendorOrders"."cancelledAt" IS NOT NULL AND
        (("vendorOrders"."cancellationSource" = 'customer' AND "vendorOrders"."cancellationReasonCode" IS NULL AND "vendorOrders"."cancellationDetails" IS NULL)
        OR ("vendorOrders"."cancellationSource" = 'vendor' AND "vendorOrders"."cancellationReasonCode" IS NOT NULL)))
    );--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD CONSTRAINT "vendor_orders_cancellation_details_check" CHECK (
      ("vendorOrders"."cancellationDetails" IS NULL OR (length("vendorOrders"."cancellationDetails") BETWEEN 1 AND 500 AND "vendorOrders"."cancellationDetails" ~ '[^[:space:]]'))
      AND ("vendorOrders"."cancellationReasonCode" IS DISTINCT FROM 'OTHER' OR "vendorOrders"."cancellationDetails" IS NOT NULL)
    );--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "order_items_cancellation_quantities_check" CHECK (
      ("orderItems"."cancellationReturnedQuantity" IS NULL AND "orderItems"."cancellationDamagedQuantity" IS NULL AND "orderItems"."cancellationMissingQuantity" IS NULL)
      OR ("orderItems"."cancellationReturnedQuantity" IS NOT NULL AND "orderItems"."cancellationDamagedQuantity" IS NOT NULL AND "orderItems"."cancellationMissingQuantity" IS NOT NULL
        AND "orderItems"."cancellationReturnedQuantity" >= 0 AND "orderItems"."cancellationDamagedQuantity" >= 0 AND "orderItems"."cancellationMissingQuantity" >= 0
        AND "orderItems"."cancellationReturnedQuantity"::bigint + "orderItems"."cancellationDamagedQuantity"::bigint + "orderItems"."cancellationMissingQuantity"::bigint = "orderItems"."productQuantity")
    );