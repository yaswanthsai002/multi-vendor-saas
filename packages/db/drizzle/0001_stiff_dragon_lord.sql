CREATE TYPE "public"."vendor_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vendor_order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "cartItems" (
	"cartItemId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cartId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_cart_product_unique" UNIQUE("cartId","productId"),
	CONSTRAINT "cartItems_quantity_positive_check" CHECK ("cartItems"."quantity" >= 1)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"cartId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carts_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"categoryId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parentCategoryId" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"vendorId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"logoUrl" text,
	"status" "vendor_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"productId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorId" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"images" text[] NOT NULL,
	"videos" text[],
	"price" numeric(12, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"isSoftDeleted" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"softDeletedAt" timestamp with time zone,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_price_nonnegative_check" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_stock_nonnegative_check" CHECK ("products"."stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "productCategories" (
	"productId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	CONSTRAINT "productCategories_productId_categoryId_pk" PRIMARY KEY("productId","categoryId")
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"orderItemId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorOrderId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productNameSnapshot" text NOT NULL,
	"productQuantity" integer NOT NULL,
	"productPriceSnapshot" numeric(12, 2) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_product_quantity_check" CHECK ("orderItems"."productQuantity" >= 1),
	CONSTRAINT "order_items_product_price_check" CHECK ("orderItems"."productPriceSnapshot" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"orderId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendorOrders" (
	"vendorOrderId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"vendorId" uuid NOT NULL,
	"status" "vendor_order_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_orders_order_vendor_unique" UNIQUE("orderId","vendorId")
);
--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_cartId_carts_cartId_fk" FOREIGN KEY ("cartId") REFERENCES "public"."carts"("cartId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentCategoryId_categories_categoryId_fk" FOREIGN KEY ("parentCategoryId") REFERENCES "public"."categories"("categoryId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_vendors_vendorId_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("vendorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCategories" ADD CONSTRAINT "productCategories_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCategories" ADD CONSTRAINT "productCategories_categoryId_categories_categoryId_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("categoryId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_vendorOrderId_vendorOrders_vendorOrderId_fk" FOREIGN KEY ("vendorOrderId") REFERENCES "public"."vendorOrders"("vendorOrderId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD CONSTRAINT "vendorOrders_orderId_orders_orderId_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("orderId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendorOrders" ADD CONSTRAINT "vendorOrders_vendorId_vendors_vendorId_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("vendorId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cartItems_cartId_idx" ON "cartItems" USING btree ("cartId");--> statement-breakpoint
CREATE INDEX "categories_parentCategoryId_idx" ON "categories" USING btree ("parentCategoryId");--> statement-breakpoint
CREATE INDEX "products_vendorId_idx" ON "products" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "productCategories_categoryId_idx" ON "productCategories" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "order_items_productId_idx" ON "orderItems" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_items_vendorOrderId_idx" ON "orderItems" USING btree ("vendorOrderId");