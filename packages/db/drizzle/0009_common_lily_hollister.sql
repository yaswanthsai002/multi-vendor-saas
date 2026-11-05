ALTER TABLE "products" RENAME COLUMN "compareAtPrice" TO "mrp";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "mrp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_mrp_not_below_price_check" CHECK ("products"."mrp" >= "products"."price");
