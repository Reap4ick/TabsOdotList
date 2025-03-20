import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todosTable = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  todo: text("todo").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  date: text("date").notNull(),
  priority: text("priority").notNull()
});

export type Todo = typeof todosTable.$inferSelect;