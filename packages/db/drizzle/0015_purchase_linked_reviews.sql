ALTER TABLE "orderItems" ADD COLUMN "reviewVersion" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "productReviews" ADD COLUMN "orderItemId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "productReviews" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "productReviews" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "productReviews" ADD CONSTRAINT "productReviews_orderItemId_orderItems_orderItemId_fk" FOREIGN KEY ("orderItemId") REFERENCES "public"."orderItems"("orderItemId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productReviews" ADD CONSTRAINT "productReviews_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productReviews" DROP COLUMN "authorName";--> statement-breakpoint
ALTER TABLE "productReviews" ADD CONSTRAINT "productReviews_orderItemId_unique" UNIQUE("orderItemId");--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "order_items_review_version_check" CHECK ("orderItems"."reviewVersion" >= 0);--> statement-breakpoint
ALTER TABLE "productReviews" ADD CONSTRAINT "product_reviews_text_length_check" CHECK (char_length("productReviews"."reviewText") <= 2000);
