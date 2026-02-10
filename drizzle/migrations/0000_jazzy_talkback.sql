CREATE TABLE `links` (
	`alias` text NOT NULL,
	`url` text NOT NULL,
	`key` text PRIMARY KEY NOT NULL,
	`expire_at` text,
	`burn_after_views` integer DEFAULT 0,
	`creation_password` text,
	`views` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_alias_unique` ON `links` (`alias`);--> statement-breakpoint
CREATE TABLE `referrers` (
	`alias` text NOT NULL,
	`domain` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`alias`, `domain`),
	FOREIGN KEY (`alias`) REFERENCES `links`(`alias`) ON UPDATE no action ON DELETE cascade
);
