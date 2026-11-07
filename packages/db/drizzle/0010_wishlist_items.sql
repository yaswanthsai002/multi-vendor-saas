CREATE TABLE "wishlistItems" (
	"userId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlistItems_userId_productId_pk" PRIMARY KEY("userId","productId")
);
--> statement-breakpoint
ALTER TABLE "wishlistItems" ADD CONSTRAINT "wishlistItems_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlistItems" ADD CONSTRAINT "wishlistItems_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;