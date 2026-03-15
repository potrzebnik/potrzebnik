INSERT INTO "user_roles" ("code", "created_at", "updated_at")
VALUES
    ('USER', now(), now()),
	('DONOR', now(), now()),
	('ORGANIZATION_ADMIN', now(), now())
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "need_types" ("code", "created_at", "updated_at")
VALUES
	('ONE_TIME', now(), now())
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "need_statuses" ("code", "created_at", "updated_at")
VALUES
	('ACTIVE', now(), now()),
	('FULFILLED', now(), now()),
	('EXPIRED', now(), now())
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "donation_statuses" ("code", "created_at", "updated_at")
VALUES
	('BOOKED', now(), now()),
	('FULFILLED', now(), now()),
	('CANCELLED', now(), now())
ON CONFLICT ("code") DO NOTHING;
