CREATE TYPE "public"."vendor_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TABLE "vendors" (
	"vendorId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"displayName" text NOT NULL,
	"slug" text NOT NULL,
	"status" "vendor_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_userId_unique" UNIQUE("userId"),
	CONSTRAINT "vendors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"categoryId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parentCategoryId" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "categories_parentCategoryId_idx" ON "categories" USING btree ("parentCategoryId");--> statement-breakpoint
CREATE TABLE "products" (
	"productId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_price_nonnegative_check" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_stock_nonnegative_check" CHECK ("products"."stock" >= 0)
);
--> statement-breakpoint
CREATE INDEX "products_vendorId_idx" ON "products" USING btree ("vendorId");--> statement-breakpoint
CREATE TABLE "productCategories" (
	"productId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	CONSTRAINT "productCategories_productId_categoryId_pk" PRIMARY KEY("productId", "categoryId")
);
--> statement-breakpoint
CREATE INDEX "productCategories_categoryId_idx" ON "productCategories" USING btree ("categoryId");--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentCategoryId_categories_categoryId_fk" FOREIGN KEY ("parentCategoryId") REFERENCES "public"."categories"("categoryId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_vendors_vendorId_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("vendorId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCategories" ADD CONSTRAINT "productCategories_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCategories" ADD CONSTRAINT "productCategories_categoryId_categories_categoryId_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("categoryId") ON DELETE cascade ON UPDATE no action;
