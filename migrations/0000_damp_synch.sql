CREATE TABLE `flight_statuses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`flight_number` text NOT NULL,
	`date` text NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`status` text,
	`etd` text,
	`atd` text,
	`delay_category` text,
	`last_updated` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_flight_date` ON `flight_statuses` (`flight_number`,`date`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `flight_statuses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_date` ON `flight_statuses` (`date`);--> statement-breakpoint
