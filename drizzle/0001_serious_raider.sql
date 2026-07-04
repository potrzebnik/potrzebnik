CREATE TABLE "address" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"city" text NOT NULL,
	"street" text NOT NULL,
	"building" text NOT NULL,
	"apartment" text,
	"zip_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"krs" text NOT NULL,
	"main_address_id" integer NOT NULL,
	"phone_number" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "organization_krs_unique" UNIQUE("krs")
);
--> statement-breakpoint
CREATE TABLE "organization_shipping_address" (
	"organization_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	CONSTRAINT "organization_shipping_address_organization_id_address_id_pk" PRIMARY KEY("organization_id","address_id")
);
--> statement-breakpoint
CREATE TABLE "donor" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "donor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "donor_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "donor_favourite_need" (
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	CONSTRAINT "donor_favourite_need_donor_id_need_id_pk" PRIMARY KEY("donor_id","need_id")
);
--> statement-breakpoint
CREATE TABLE "need" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "need_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"delivery_address_id" integer NOT NULL,
	"description" text NOT NULL,
	"beneficiary_name" text NOT NULL,
	"requested_item" text NOT NULL,
	"photo" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "need_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"need_id" integer NOT NULL,
	"to_status" text NOT NULL,
	"changed_by_user_id" text NOT NULL,
	"changed_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "donation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"donor_id" integer NOT NULL,
	"need_id" integer NOT NULL,
	"status" text NOT NULL,
	"booked_at" timestamp NOT NULL,
	"fulfilled_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_main_address_id_address_id_fk" FOREIGN KEY ("main_address_id") REFERENCES "public"."address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_shipping_address" ADD CONSTRAINT "organization_shipping_address_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_shipping_address" ADD CONSTRAINT "organization_shipping_address_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor" ADD CONSTRAINT "donor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_need" ADD CONSTRAINT "donor_favourite_need_donor_id_donor_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_favourite_need" ADD CONSTRAINT "donor_favourite_need_need_id_need_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."need"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need" ADD CONSTRAINT "need_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need" ADD CONSTRAINT "need_delivery_address_id_address_id_fk" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_need_id_need_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."need"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_status_history" ADD CONSTRAINT "need_status_history_changed_by_user_id_user_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_donor_id_donor_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_need_id_need_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."need"("id") ON DELETE no action ON UPDATE no action;