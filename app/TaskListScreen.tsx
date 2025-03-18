import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Todo } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { initDB, getTodos, deleteTodo, updateTodo } from '../store/db';

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

const TaskListScreen = ({ route }: TaskListScreenProps) => {
  const [localTasks, setLocalTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'TaskList'>>();

  const loadData = async () => {
    try {
      await initDB();
      const localTodos = await getTodos();
      setLocalTasks(localTodos);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.newTask) {
      setLocalTasks(prevLocal => {
        const updatedLocal = [...prevLocal, route.params.newTask!];
        return updatedLocal;
      });
    }
  }, [route.params?.newTask]);

  const toggleTaskCompletion = async (id: number) => {
    const task = localTasks.find(task => task.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTodo(updatedTask);
      setLocalTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    }
  };

  const deleteTask = async (id: number) => {
    await deleteTodo(id);
    setLocalTasks(prev => prev.filter(task => task.id !== id));
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity 
        onPress={() => toggleTaskCompletion(item.id)} 
        style={styles.taskTextContainer}
      >
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.todo}
        </Text>
        <Text style={styles.taskDate}>
          {new Date(item.date).toLocaleDateString('uk-UA')}
        </Text>
        <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
      </TouchableOpacity>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
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
            data={localTasks}
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