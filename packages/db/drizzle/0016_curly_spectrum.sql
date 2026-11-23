ALTER TYPE "public"."media_status" ADD VALUE 'deleting';--> statement-breakpoint
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_published_fields_check";--> statement-breakpoint
ALTER TABLE "mediaLibrary" ALTER COLUMN "vendorId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "draft_desktop_media_id" uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "draft_mobile_media_id" uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "desktop_media_id" uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "mobile_media_id" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "imageMediaId" uuid;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_draft_desktop_media_id_mediaLibrary_mediaId_fk" FOREIGN KEY ("draft_desktop_media_id") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_draft_mobile_media_id_mediaLibrary_mediaId_fk" FOREIGN KEY ("draft_mobile_media_id") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_desktop_media_id_mediaLibrary_mediaId_fk" FOREIGN KEY ("desktop_media_id") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_mobile_media_id_mediaLibrary_mediaId_fk" FOREIGN KEY ("mobile_media_id") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_imageMediaId_mediaLibrary_mediaId_fk" FOREIGN KEY ("imageMediaId") REFERENCES "public"."mediaLibrary"("mediaId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "draft_desktop_banner_prefix";--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "draft_mobile_banner_prefix";--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "mobile_image_url";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "imageUrl";--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_published_fields_check" CHECK ("campaigns"."status" = 'draft' OR (
        "campaigns"."eyebrow" IS NOT NULL AND "campaigns"."title" IS NOT NULL AND
        "campaigns"."subtitle" IS NOT NULL AND "campaigns"."desktop_media_id" IS NOT NULL AND
        "campaigns"."cta_label" IS NOT NULL AND "campaigns"."cta_href" IS NOT NULL AND
        "campaigns"."starts_at" IS NOT NULL AND "campaigns"."ends_at" IS NOT NULL AND
        "campaigns"."ends_at" > "campaigns"."starts_at"
      ));
