import { Tabs } from 'expo-router';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Створити',
          tabBarIcon: ({ color }) => <AntDesign name="pluscircleo" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Список',
          tabBarIcon: ({ color }) => <FontAwesome name="list" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}