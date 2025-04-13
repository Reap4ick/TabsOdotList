import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { todosTable, Todo } from '../../store/schema';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppDispatch } from '../hook';
import { setNotifications } from '../slices/menuSlice';
import * as Notifications from 'expo-notifications';

const notifications = {
    async cancel(id: string) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
};

export default function TaskListScreen() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const db = drizzle(useSQLiteContext());
    const dispatch = useAppDispatch();
    const { refresh } = useLocalSearchParams();

    

    const loadTodos = useCallback(async () => {
        try {
            const result = await db.select().from(todosTable).all();
            setTodos(result);
            
            const uncompletedCount = result.filter(todo => !todo.completed).length;
            dispatch(setNotifications(uncompletedCount));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTodos();
        }, [loadTodos, refresh])
    );

    const toggleCompletion = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await db.update(todosTable)
                .set({ completed: !todo.completed })
                .where(eq(todosTable.id, id))
                .execute();
            loadTodos(); // Оновлюємо список та лічильник
        }
    };

    const deleteTodo = async (id: number, notificationId: string) => {
        await notifications.cancel(notificationId);
        await db.delete(todosTable)
            .where(eq(todosTable.id, id))
            .execute();
        loadTodos(); // Оновлюємо список та лічильник
    };

    const renderItem = ({ item }: { item: Todo }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity 
                onPress={() => toggleCompletion(item.id)} 
                style={styles.taskTextContainer}
            >
                <Text style={[styles.taskText, item.completed && styles.completedText]}>
                    {item.todo}
                </Text>
                <Text style={styles.taskDate}>
                    {new Date(item.date).toLocaleDateString('uk-UA')}
                </Text>
                <Text style={styles.taskPriority}>Пріоритет: {item.priority}</Text>
            </TouchableOpacity>
            <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => item.notificationId && deleteTodo(item.id, item.notificationId)}
                    accessibilityRole="button"
                    accessibilityLabel="delete button">
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
                <FlatList
                    data={todos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Немає завдань! Додайте перше</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        marginTop: 15
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
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#6c757d',
        marginTop: 20,
    },
});