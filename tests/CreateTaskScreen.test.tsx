import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateTaskScreen from '../app/(tabs)/create';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../app/hook';
import useNotifications from '../app/hook/useNotifications';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn() }));
jest.mock('drizzle-orm/expo-sqlite', () => ({ drizzle: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('../app/hook', () => ({ useAppDispatch: jest.fn() }));
jest.mock('../app/hook/useNotifications', () => jest.fn());

describe('CreateTaskScreen', () => {
  const mockRouter = { replace: jest.fn() };
  const mockDispatch = jest.fn();
  const mockScheduleNotification = jest.fn().mockResolvedValue('notification-id');
  const mockInsertBuilder = {
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([{ id: 1 }]),
  };
  const mockUpdateBuilder = {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([{ id: 1 }]),
  };
  const mockDb = {
    insert: jest.fn().mockReturnValue(mockInsertBuilder),
    update: jest.fn().mockReturnValue(mockUpdateBuilder), 
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSQLiteContext as jest.Mock).mockReturnValue({});
    (drizzle as jest.Mock).mockReturnValue(mockDb);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useNotifications as jest.Mock).mockReturnValue({
      scheduleNotification: mockScheduleNotification,
      cancelNotification: jest.fn(),
    });
  });

  it('renders task name input', () => {
    render(<CreateTaskScreen />);
    const input = screen.getByPlaceholderText('Введіть назву завдання');
    expect(input).toBeTruthy();
  });

  it('renders date and time picker buttons', () => {
    render(<CreateTaskScreen />);
    const dateButton = screen.getByText('Обрати дату');
    const timeButton = screen.getByText('Обрати час');
    expect(dateButton).toBeTruthy();
    expect(timeButton).toBeTruthy();
  });
  it('schedules notification when task is created', async () => {
    render(<CreateTaskScreen />);
  
    const selectedTextElement = screen.getByText(/Обрано:/);
    const children = selectedTextElement.props.children;
    const dateStr = children[1];
    const timeStr = children[3];
    const notificationDate = new Date(`${dateStr}T${timeStr}`);
  
    const input = screen.getByPlaceholderText('Введіть назву завдання');
    fireEvent.changeText(input, 'Нове завдання');
  
    const submitButton = screen.getByText('Створити завдання');
    fireEvent.press(submitButton);
  
    await waitFor(() => {
      expect(mockScheduleNotification).toHaveBeenCalledWith(
        '1',
        'Нове завдання', 
        notificationDate 
      );
    });
  });

  it('adds new task when submit button is pressed', async () => {
    render(<CreateTaskScreen />);

    const input = screen.getByPlaceholderText('Введіть назву завдання');
    fireEvent.changeText(input, 'Нове завдання');

    const submitButton = screen.getByText('Створити завдання');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockInsertBuilder.values).toHaveBeenCalledWith({
        todo: 'Нове завдання',
        completed: false,
        date: expect.any(String),
        time: expect.any(String),
        priority: 'low',
      });
    });

    await waitFor(() => {
      expect(mockUpdateBuilder.set).toHaveBeenCalledWith({
        notificationId: 'notification-id'
      });
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/list',
      params: { refresh: expect.any(Number) },
    });
  });
});
