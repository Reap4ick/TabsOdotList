import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Suspense } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import TaskListScreen from './TaskListScreen';
import CreateTaskScreen from './CreateScreen';
import { todosTable } from '../store/schema';

const Stack = createNativeStackNavigator();

const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const db = drizzle(useSQLiteContext(), { schema: { todosTable } });
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

const App = () => {
  return (
    <SQLiteProvider databaseName="todos2.db" useSuspense>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <DatabaseProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="TaskList">
              <Stack.Screen
                name="TaskList"
                component={TaskListScreen}
                options={{ title: 'Odot list' }}
              />
              <Stack.Screen
                name="CreateTask"
                component={CreateTaskScreen}
                options={{ title: 'New Task' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </DatabaseProvider>
      </Suspense>
    </SQLiteProvider>
  );
};

export default App;