import { Stack } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { Suspense } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { todosTable } from '../store/schema';
import { Provider } from 'react-redux';
import { store } from './store';

const databaseName = 'todos1.db';

export default function RootLayout() {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={databaseName}
        useSuspense
      >
        <Provider store={store}>
          <DatabaseProvider>
            <NavigationContainer>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </NavigationContainer>
          </DatabaseProvider>
        </Provider>
      </SQLiteProvider>
    </Suspense>
  );
}

function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = drizzle(useSQLiteContext(), { schema: { todosTable } });
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Помилка міграцій: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return <ActivityIndicator size="large" />;
  }

  return children;
}