CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`todo` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`date` text NOT NULL,
	`priority` text NOT NULL
);
