export type RootStackParamList = {
  TaskList: undefined;
  CreateTask: undefined;
};

export type Todo = {
  id: number;
  todo: string;
  completed: boolean;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  isLocal: boolean;
  notificationId: string;
};