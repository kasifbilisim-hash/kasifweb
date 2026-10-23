ALTER TABLE "packages" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "includes_ads" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;