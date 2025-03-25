import { time } from "drizzle-orm/mysql-core";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todosTable = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  todo: text("todo").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  date: text("date").notNull(),
  time: text("time").notNull(),
  priority: text("priority").notNull(),
  notificationId: text('notification_id')
});

export type Todo = typeof todosTable.$inferSelect;