CREATE TABLE "customerAddresses" (
	"addressId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"recipientName" text NOT NULL,
	"phone" text NOT NULL,
	"addressLine1" text NOT NULL,
	"addressLine2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderDeliveryAddresses" (
	"deliveryAddressId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"recipientName" text NOT NULL,
	"phone" text NOT NULL,
	"addressLine1" text NOT NULL,
	"addressLine2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orderDeliveryAddresses_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
ALTER TABLE "vendorOrders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "vendorOrders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."vendor_order_status";--> statement-breakpoint
CREATE TYPE "public"."vendor_order_status" AS ENUM('pending', 'processing', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "vendorOrders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."vendor_order_status";--> statement-breakpoint
ALTER TABLE "vendorOrders" ALTER COLUMN "status" SET DATA TYPE "public"."vendor_order_status" USING "status"::"public"."vendor_order_status";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "orderNumber" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "cancellationReason" text;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD COLUMN "completedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customerAddresses" ADD CONSTRAINT "customerAddresses_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderDeliveryAddresses" ADD CONSTRAINT "orderDeliveryAddresses_orderId_orders_orderId_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("orderId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_addresses_userId_idx" ON "customerAddresses" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "vendor_orders_status_idx" ON "vendorOrders" USING btree ("status");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber");