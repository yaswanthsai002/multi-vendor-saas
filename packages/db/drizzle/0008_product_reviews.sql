CREATE TABLE "productReviews" (
	"reviewId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"authorName" text NOT NULL,
	"rating" integer NOT NULL,
	"reviewText" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_reviews_rating_check" CHECK ("productReviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "productReviews" ADD CONSTRAINT "productReviews_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_reviews_product_created_idx" ON "productReviews" USING btree ("productId","createdAt","reviewId");