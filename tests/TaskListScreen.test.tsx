import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import TaskListScreen from '../app/(tabs)/list';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAppDispatch } from '../app/hook';
import * as Notifications from 'expo-notifications';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn() }));
jest.mock('drizzle-orm/expo-sqlite', () => ({ drizzle: jest.fn() }));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn((callback) => callback()),
}));
jest.mock('../app/hook', () => ({ useAppDispatch: jest.fn() }));
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('TaskListScreen', () => {
  const mockDispatch = jest.fn();
  const mockDb: {
    select: jest.Mock;
    delete?: jest.Mock;
  } = {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([]),
      }),
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSQLiteContext as jest.Mock).mockReturnValue({});
    const mockDeleteBuilder = {
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    mockDb.delete = jest.fn().mockReturnValue(mockDeleteBuilder);
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([]),
      }),
    });
    (drizzle as jest.Mock).mockReturnValue(mockDb);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ refresh: Date.now() });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders header on main screen', async () => {
    render(<TaskListScreen />);
    await waitFor(() => {
      const header = screen.getByText('Odot List');
      expect(header).toBeTruthy();
    });
  });

it('cancels notification when task is deleted', async () => {
    const task = {
      id: 1,
      todo: 'Test task',
      completed: false,
      date: '2023-10-17',
      time: '14:30',
      priority: 'low',
      notificationId: 'notif-1',
    };
    
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([task]),
      }),
    });
  
    render(<TaskListScreen />);
  
    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeTruthy();
    });
  
    const deleteButton = screen.getByRole('button', { name: /delete button/i });
    
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
    });
  });
});