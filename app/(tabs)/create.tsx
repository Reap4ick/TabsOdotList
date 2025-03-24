import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { todosTable } from '../../store/schema';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../hook';
import { incrementNotifications } from '../slices/menuSlice';

type FormValues = {
    title: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
};

export default function CreateTaskScreen() {
    const db = drizzle(useSQLiteContext());
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { control, handleSubmit, setValue, reset } = useForm<FormValues>({
        defaultValues: {
            title: '',
            date: new Date().toISOString().split('T')[0],
            priority: 'low',
        }
    });

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setValue('date', formattedDate);
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (!data.title.trim()) {
            Alert.alert('Помилка', 'Введіть назву завдання');
            return;
        }

        try {
            await db.insert(todosTable).values({
                todo: data.title,
                completed: false,
                date: data.date,
                priority: data.priority
            }).execute();
            
            dispatch(incrementNotifications());
            reset();
            router.replace({
                pathname: '/list',
                params: { refresh: Date.now() } // Додаємо параметр для примусового оновлення
            });
        } catch (error) {
            Alert.alert('Помилка', 'Не вдалося зберегти завдання');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Нове завдання</Text>

            <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholder="Введіть назву завдання"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />

            <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateButtonText}>Обрати дату</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Text>Оберіть пріоритет:</Text>
            <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                    <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}>
                        <Picker.Item label="Низький" value="low" />
                        <Picker.Item label="Середній" value="medium" />
                        <Picker.Item label="Високий" value="high" />
                    </Picker>
                )}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.submitButtonText}>Створити</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
        paddingTop: 40, 
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    picker: {
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
    },
    dateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});