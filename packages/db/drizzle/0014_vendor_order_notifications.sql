CREATE TYPE "public"."vendor_order_notification_type" AS ENUM('new_order', 'customer_cancelled');--> statement-breakpoint
CREATE TABLE "vendorOrderNotifications" (
	"notificationId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorOrderId" uuid NOT NULL,
	"type" "vendor_order_notification_type" NOT NULL,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"readAt" timestamp (3) with time zone,
	CONSTRAINT "vendor_order_notifications_portion_type_unique" UNIQUE("vendorOrderId","type")
);
--> statement-breakpoint
ALTER TABLE "vendorOrderNotifications" ADD CONSTRAINT "vendorOrderNotifications_vendorOrderId_vendorOrders_vendorOrderId_fk" FOREIGN KEY ("vendorOrderId") REFERENCES "public"."vendorOrders"("vendorOrderId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendor_order_notifications_created_id_idx" ON "vendorOrderNotifications" USING btree ("createdAt","notificationId");