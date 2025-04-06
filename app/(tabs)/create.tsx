import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Todo, todosTable } from '../../store/schema';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../hook';
import { incrementNotifications } from '../slices/menuSlice';
import { eq } from 'drizzle-orm';
import useNotifications from '../hook/useNotifications';
import * as Notifications from 'expo-notifications';

export default function CreateTaskScreen() {
  const db = drizzle(useSQLiteContext());
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const { control, handleSubmit, setValue, reset } = useForm<Pick<Todo, 'todo' | 'date' | 'time' | 'priority'>>({
    defaultValues: {
      todo: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      priority: 'low',
    }
  });

  const { scheduleNotification } = useNotifications({
    onDelete: async (taskId: string) => {
      try {
        await db.delete(todosTable)
          .where(eq(todosTable.id, parseInt(taskId)))
          .execute();

        const notificationIdResult = await db.select({ notificationId: todosTable.notificationId })
          .from(todosTable)
          .where(eq(todosTable.id, parseInt(taskId)))
          .execute();

        if (notificationIdResult[0]?.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(
            notificationIdResult[0].notificationId
          );
        }

        dispatch(incrementNotifications());
        router.push({
          pathname: '/list',
          params: { refresh: Date.now() }
        });
      } catch (error) {
        Alert.alert('Помилка', 'Не вдалося видалити завдання');
      }
    },
    onShow: () => router.push('/list')
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setValue('date', formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      setValue('time', formattedTime);
    }
  };

  const onSubmit = async (data: Pick<Todo, 'todo' | 'date' | 'time' | 'priority'>) => {
    if (!data.todo.trim()) {
      Alert.alert('Помилка', 'Введіть назву завдання');
      return;
    }

    try {
      const result = await db.insert(todosTable).values({
        todo: data.todo,
        completed: false,
        date: data.date,
        time: data.time,
        priority: data.priority
      }).returning({ id: todosTable.id }).execute();

      const newTaskId = result[0].id.toString();
      const notificationDate = new Date(`${data.date}T${data.time}`);
      
      const notificationId = await scheduleNotification(
        newTaskId,
        data.todo,
        notificationDate
      );

      await db.update(todosTable)
        .set({ notificationId })
        .where(eq(todosTable.id, parseInt(newTaskId)))
        .execute();

      dispatch(incrementNotifications());
      reset();
      router.replace({
        pathname: '/list',
        params: { refresh: Date.now() }
      });

    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти завдання');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Нове завдання</Text>

      <Controller
        control={control}
        name="todo"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Введіть назву завдання"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.dateTimeButton, { flex: 1, marginRight: 5 }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>Обрати дату</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dateTimeButton, { flex: 1, marginLeft: 5 }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateTimeButtonText}>Обрати час</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectedDateTimeContainer}>
        <Text style={styles.selectedDateTimeText}>
          Обрано: {control._formValues.date} {control._formValues.time}
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}

      <Text style={styles.priorityLabel}>Оберіть пріоритет:</Text>
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
        <Text style={styles.submitButtonText}>Створити завдання</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  dateTimeButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 2,
  },
  dateTimeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectedDateTimeContainer: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedDateTimeText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  priorityLabel: {
    marginBottom: 10,
    fontSize: 16,
    color: '#34495e',
    fontWeight: '600',
  },
});