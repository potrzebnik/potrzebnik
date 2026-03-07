CREATE TYPE "public"."donation_status" AS ENUM('BOOKED', 'FULFILLED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."need_status" AS ENUM('ACTIVE', 'FULFILLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."need_type" AS ENUM('ONE_TIME');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('DONOR', 'ORGANIZATION_ADMIN');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"street" text NOT NULL,
	"building" text NOT NULL,
	"apartment" text,
	"zip_code" varchar(16) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"krs" varchar(10) NOT NULL,
	"address_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "organizations_krs_unique" UNIQUE("krs")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "donor_favourite_needs" (
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "donor_favourite_needs_pkey" PRIMARY KEY("donor_id","need_id")
);
--> statement-breakpoint
CREATE TABLE "need_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"need_id" integer NOT NULL,
	"status" "need_status" NOT NULL,
	"changed_by_id" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "needs" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"donee" text NOT NULL,
	"item" text NOT NULL,
	"address_id" integer NOT NULL,
	"expiry" date NOT NULL,
	"photo" text,
	"status" "need_status" NOT NULL,
	"category_id" integer NOT NULL,
	"type" "need_type" NOT NULL,
	"important" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	"status" "donation_status" NOT NULL,
	"booked_at" timestamp with time zone NOT NULL,
	"fulfilled_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "donations_donor_need_unique" UNIQUE("donor_id","need_id")
);
--> statement-breakpoint
ALTER TABLE "donors" ADD CONSTRAINT "donors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_category_id_organization_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."organization_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_needs" ADD CONSTRAINT "donor_favourite_needs_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_needs" ADD CONSTRAINT "donor_favourite_needs_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_category_id_need_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."need_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "needs_organization_id_idx" ON "needs" USING btree ("organization_id");