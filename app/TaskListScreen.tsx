import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { todosTable, Todo } from '../store/schema';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskList'>;
};

const TaskListScreen = ({ navigation }: Props) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const db = drizzle(useSQLiteContext());

  const loadTodos = async () => {
    try {
      const result = await db.select().from(todosTable).all();
      setTodos(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const toggleCompletion = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await db.update(todosTable)
        .set({ completed: !todo.completed })
        .where(eq(todosTable.id, id))
        .execute();
      loadTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    await db.delete(todosTable)
      .where(eq(todosTable.id, id))
      .execute();
    loadTodos();
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleCompletion(item.id)} style={styles.taskTextContainer}>
        <Text style={[styles.taskText, item.completed ? styles.completedText : undefined]}>
          {item.todo}
        </Text>
        <Text style={styles.taskDate}>
          {new Date(item.date).toLocaleDateString('uk-UA')}
        </Text>
        <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
      </TouchableOpacity>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => deleteTodo(item.id)}>
          <AntDesign name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odot List</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          <FlatList
            data={todos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>There are no tasks! Add the first one</Text>
            }
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskText: {
    fontSize: 16,
    color: '#212529',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6C757D',
  },
  taskDate: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  taskPriority: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#007BFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
});

export default TaskListScreen;