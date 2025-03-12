export type RootStackParamList = {
  TaskList: { newTask?: Todo };
  CreateTask: undefined;
};

export type Todo = {
  id: number;
  todo: string;
  completed: boolean;
  date: string;
  priority: 'low' | 'medium' | 'high';
  isLocal: boolean;
};
