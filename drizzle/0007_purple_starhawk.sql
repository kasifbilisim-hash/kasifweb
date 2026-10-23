ALTER TABLE "packages" ADD COLUMN "domain_fee_extra" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "domain_fee_kurus" integer;