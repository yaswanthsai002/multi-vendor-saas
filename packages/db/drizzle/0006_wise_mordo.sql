CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."product_moderation_status" AS ENUM('approved', 'hidden', 'rejected');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspensionReason" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "suspensionReason" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "isFeatured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "compareAtPrice" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "moderationStatus" "product_moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "moderationReason" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isFeatured" boolean DEFAULT false NOT NULL;