PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`todo` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`priority` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_todos`("id", "todo", "completed", "date", "time", "priority") SELECT "id", "todo", "completed", "date", "time", "priority" FROM `todos`;--> statement-breakpoint
DROP TABLE `todos`;--> statement-breakpoint
ALTER TABLE `__new_todos` RENAME TO `todos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;