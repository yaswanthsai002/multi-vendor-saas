LOCK TABLE "orders" IN ACCESS EXCLUSIVE MODE;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "orders") THEN
    RAISE EXCEPTION 'Checkout migration requires an empty orders table';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "customerAddresses" ALTER COLUMN "country" SET DEFAULT 'IN';--> statement-breakpoint
ALTER TABLE "orderDeliveryAddresses" ALTER COLUMN "country" SET DEFAULT 'IN';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "requestKey" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "requestFingerprint" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_request_key_unique" UNIQUE("userId","requestKey");
--> statement-breakpoint
UPDATE "customerAddresses" SET "country" = 'IN';
--> statement-breakpoint
UPDATE "orderDeliveryAddresses" SET "country" = 'IN';
