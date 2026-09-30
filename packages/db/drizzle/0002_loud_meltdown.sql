CREATE TYPE "public"."media_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "mediaLibrary" (
	"mediaId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" uuid NOT NULL,
	"createdBy" uuid NOT NULL,
	"mediaType" "media_type" NOT NULL,
	"originalFileName" text NOT NULL,
	"mimeType" text NOT NULL,
	"fileSizeBytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"durationSeconds" integer,
	"originalStorageKey" text NOT NULL,
	"status" "media_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"disabledAt" timestamp with time zone,
	CONSTRAINT "media_library_file_size_positive_check" CHECK ("mediaLibrary"."fileSizeBytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "productMedia" (
	"productId" uuid NOT NULL,
	"mediaId" uuid NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "productMedia_productId_mediaId_pk" PRIMARY KEY("productId","mediaId")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "productImageId" uuid;--> statement-breakpoint
ALTER TABLE "mediaLibrary" ADD CONSTRAINT "mediaLibrary_vendorId_vendors_vendorId_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("vendorId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediaLibrary" ADD CONSTRAINT "mediaLibrary_createdBy_users_userId_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productMedia" ADD CONSTRAINT "productMedia_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productMedia" ADD CONSTRAINT "productMedia_mediaId_mediaLibrary_mediaId_fk" FOREIGN KEY ("mediaId") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_library_vendorId_idx" ON "mediaLibrary" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "media_library_vendorId_status_idx" ON "mediaLibrary" USING btree ("vendorId","status");--> statement-breakpoint
CREATE INDEX "media_library_vendorId_mediaType_idx" ON "mediaLibrary" USING btree ("vendorId","mediaType");--> statement-breakpoint
CREATE INDEX "product_media_productId_idx" ON "productMedia" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "product_media_mediaId_idx" ON "productMedia" USING btree ("mediaId");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_productImageId_mediaLibrary_mediaId_fk" FOREIGN KEY ("productImageId") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_productImageId_idx" ON "products" USING btree ("productImageId");--> statement-breakpoint
CREATE INDEX "vendor_orders_vendorId_idx" ON "vendorOrders" USING btree ("vendorId");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "videos";