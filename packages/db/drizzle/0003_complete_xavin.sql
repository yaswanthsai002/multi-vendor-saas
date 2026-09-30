ALTER TABLE "products" ADD COLUMN "shortDescription" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "products_vendorId_published_idx" ON "products" USING btree ("vendorId","published");