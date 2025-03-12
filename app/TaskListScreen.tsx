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
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Todo } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

type ApiTodo = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

const TaskListScreen = ({ route }: TaskListScreenProps) => {
  const [apiTasks, setApiTasks] = useState<Todo[]>([]);
  const [localTasks, setLocalTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'TaskList'>>();

  const saveLocalTasksToStorage = async (tasks: Todo[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving local tasks:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedLocalTasksJson = await AsyncStorage.getItem('tasks');
      const storedLocalTasks: Todo[] = savedLocalTasksJson ? JSON.parse(savedLocalTasksJson) : [];
      setLocalTasks(storedLocalTasks);

      const response = await axios.get<{ todos: ApiTodo[] }>('https://dummyjson.com/todos');
      const fetchedApiTasks = response.data.todos.map((task): Todo => ({
        ...task,
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        isLocal: false,
      }));
      setApiTasks(fetchedApiTasks);
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
        saveLocalTasksToStorage(updatedLocal);
        // console.log('Current tasks list:', [...apiTasks, ...updatedLocal]);
        return updatedLocal;
      });
    }
  }, [route.params?.newTask, apiTasks]);

  const toggleTaskCompletion = (id: number, isLocal: boolean) => {
    if (isLocal) {
      setLocalTasks(prev => {
        const updated = prev.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveLocalTasksToStorage(updated);
        // console.log('Current tasks list:', [...apiTasks, ...updated]);
        return updated;
      });
    } else {
      setApiTasks(prev => {
        const updated = prev.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        // console.log('Current tasks list:', [...updated, ...localTasks]);
        return updated;
      });
    }
  };

  const deleteTask = (id: number, isLocal: boolean) => {
    if (isLocal) {
      setLocalTasks(prev => {
        const updated = prev.filter(task => task.id !== id);
        saveLocalTasksToStorage(updated);
        // console.log('Current tasks list:', [...apiTasks, ...updated]);
        return updated;
      });
    } else {
      setApiTasks(prev => {
        const updated = prev.filter(task => task.id !== id);
        // console.log('Current tasks list:', [...updated, ...localTasks]);
        return updated;
      });
    }
  };

  const combinedTasks = [...apiTasks, ...localTasks];

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity 
        onPress={() => toggleTaskCompletion(item.id, item.isLocal)} 
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
        <TouchableOpacity onPress={() => deleteTask(item.id, item.isLocal)}>
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
            data={combinedTasks}
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
