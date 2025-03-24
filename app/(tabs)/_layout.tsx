import { Tabs } from 'expo-router';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../hook';
import { selectNotifications, setNotifications } from '../slices/menuSlice';
import { useEffect } from 'react';

import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { todosTable } from '../../store/schema';

export default function TabLayout() {
  const notifications = useAppSelector(selectNotifications);
  const dispatch = useAppDispatch();
  const db = drizzle(useSQLiteContext());

  // Завантажуємо кількість невиконаних завдань при першому рендері
  useEffect(() => {
    const loadInitialCount = async () => {
      try {
        const result = await db.select().from(todosTable).all();
        const uncompletedCount = result.filter(todo => !todo.completed).length;
        dispatch(setNotifications(uncompletedCount));
      } catch (error) {
        console.error('Помилка завантаження завдань:', error);
      }
    };

    loadInitialCount();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Створити',
          tabBarIcon: ({ color }) => <AntDesign name="pluscircleo" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Список',
          tabBarIcon: ({ color }) => <FontAwesome name="list" size={24} color={color} />,
          tabBarBadge: notifications === 0 ? undefined : notifications,
        }}
      />
    </Tabs>
  );
}