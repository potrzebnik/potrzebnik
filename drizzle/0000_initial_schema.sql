CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"city" text NOT NULL,
	"street" text NOT NULL,
	"building" text NOT NULL,
	"apartment" text,
	"zip_code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"role_id" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "donor_favourite_needs" (
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "donor_favourite_needs_pkey" PRIMARY KEY("donor_id","need_id")
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "donors_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "organization_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"krs" text NOT NULL,
	"category_id" integer NOT NULL,
	"phone_number" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "organizations_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "organizations_krs_unique" UNIQUE("krs")
);
--> statement-breakpoint
CREATE TABLE "need_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "need_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"need_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"changed_by_id" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "need_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "need_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "need_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "need_types_code_unique" UNIQUE("code")
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
	"status_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"important" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "donation_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "donation_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"booked_at" timestamp with time zone NOT NULL,
	"fulfilled_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_needs" ADD CONSTRAINT "donor_favourite_needs_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_needs" ADD CONSTRAINT "donor_favourite_needs_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donors" ADD CONSTRAINT "donors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_category_id_organization_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."organization_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_status_id_need_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."need_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_status_id_need_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."need_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_category_id_need_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."need_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_type_id_need_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."need_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_status_id_donation_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."donation_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_organization_id_idx" ON "addresses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "needs_organization_id_idx" ON "needs" USING btree ("organization_id");