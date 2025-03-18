import * as SQLite from 'expo-sqlite';
import { Todo } from '../app/types';

const db = SQLite.openDatabaseSync('todos.db');

export async function initDB() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY NOT NULL,
      todo TEXT NOT NULL,
      completed BOOLEAN NOT NULL,
      date TEXT NOT NULL,
      priority TEXT NOT NULL
    );
  `);
}

export async function addTodo(todo: Todo) {
  await db.runAsync(
    'INSERT INTO todos (todo, completed, date, priority) VALUES (?, ?, ?, ?);',
    [todo.todo, todo.completed ? 1 : 0, todo.date, todo.priority]
  );
}

export async function deleteTodo(id: number) {
  await db.runAsync('DELETE FROM todos WHERE id = ?;', [id]);
}

export async function updateTodo(todo: Todo) {
  await db.runAsync(
    'UPDATE todos SET todo = ?, completed = ?, date = ?, priority = ? WHERE id = ?;',
    [todo.todo, todo.completed ? 1 : 0, todo.date, todo.priority, todo.id]
  );
}

export async function getTodos(): Promise<Todo[]> {
  const todos = await db.getAllAsync<{ id: number; todo: string; completed: number; date: string; priority: string }>('SELECT * FROM todos;');
  return todos.map((todo: { id: any; todo: any; completed: number; date: any; priority: string; }) => ({
    id: todo.id,
    todo: todo.todo,
    completed: todo.completed === 1,
    date: todo.date,
    priority: todo.priority as 'low' | 'medium' | 'high',
    isLocal: true
  }));
}