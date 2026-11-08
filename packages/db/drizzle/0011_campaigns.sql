CREATE TABLE "campaign_products" (
	"campaign_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"deal_price" numeric(12, 2) NOT NULL,
	CONSTRAINT "campaign_products_campaign_id_product_id_pk" PRIMARY KEY("campaign_id","product_id"),
	CONSTRAINT "campaign_products_deal_price_positive_check" CHECK ("campaign_products"."deal_price" > 0)
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"campaign_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source_campaign_id" uuid,
	"owner_user_id" uuid,
	"draft_payload" jsonb,
	"draft_desktop_banner_prefix" text,
	"draft_mobile_banner_prefix" text,
	"eyebrow" text,
	"title" text,
	"subtitle" text,
	"image_url" text,
	"mobile_image_url" text,
	"cta_label" text,
	"cta_href" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_status_check" CHECK ("campaigns"."status" IN ('draft', 'published')),
	CONSTRAINT "campaigns_draft_payload_check" CHECK ("campaigns"."status" = 'published' OR "campaigns"."draft_payload" IS NOT NULL),
	CONSTRAINT "campaigns_published_fields_check" CHECK ("campaigns"."status" = 'draft' OR (
        "campaigns"."eyebrow" IS NOT NULL AND "campaigns"."title" IS NOT NULL AND
        "campaigns"."subtitle" IS NOT NULL AND "campaigns"."image_url" IS NOT NULL AND
        "campaigns"."cta_label" IS NOT NULL AND "campaigns"."cta_href" IS NOT NULL AND
        "campaigns"."starts_at" IS NOT NULL AND "campaigns"."ends_at" IS NOT NULL AND
        "campaigns"."ends_at" > "campaigns"."starts_at"
      ))
);
--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_product_id_products_productId_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("productId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_user_id_users_userId_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_source_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("source_campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_products_product_id_idx" ON "campaign_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_schedule_idx" ON "campaigns" USING btree ("status","starts_at","ends_at","position");--> statement-breakpoint
CREATE INDEX "campaigns_owner_updated_idx" ON "campaigns" USING btree ("owner_user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_owner_source_unique" ON "campaigns" USING btree ("owner_user_id","source_campaign_id") WHERE "campaigns"."source_campaign_id" IS NOT NULL;