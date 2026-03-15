CREATE INDEX "need_status_history_need_id_idx" ON "need_status_history" USING btree ("need_id");--> statement-breakpoint
CREATE INDEX "need_status_history_changed_by_id_idx" ON "need_status_history" USING btree ("changed_by_id");--> statement-breakpoint
CREATE INDEX "donations_donor_id_idx" ON "donations" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "donations_need_id_idx" ON "donations" USING btree ("need_id");