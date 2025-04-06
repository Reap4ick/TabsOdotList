import { useEffect, useState } from "react";
import { AppState, Linking, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationResponse } from "expo-notifications";

type NotificationCallbacks = {
  onDelete: (taskId: string) => Promise<void>;
  onShow: () => void;
};

function useNotifications({ onDelete, onShow }: NotificationCallbacks) {
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

    useEffect(() => {
        const setupNotifications = async () => {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            await Notifications.setNotificationCategoryAsync('myCategory', [
                {
                    identifier: 'show',
                    buttonTitle: "Переглянути",
                    options: { opensAppToForeground: true }
                },
                {
                    identifier: "delete",
                    buttonTitle: "Видалити",
                    options: { 
                        isDestructive: true,
                        opensAppToForeground: true
                    }
                }
            ]);
        };

        setupNotifications();
    }, []);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && pendingTaskId) {
                setTimeout(() => {
                    Alert.alert(
                        'Видалити завдання',
                        'Ви впевнені, що хочете видалити це завдання?',
                        [
                            { text: 'Скасувати', style: 'cancel' },
                            { 
                                text: 'Видалити', 
                                onPress: () => onDelete(pendingTaskId)
                            }
                        ]
                    );
                    setPendingTaskId(null);
                }, 500);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [pendingTaskId]);

    const handleNotificationAction = (response: NotificationResponse) => {
        const { actionIdentifier, notification } = response;
        const taskId = notification.request.content.data.id?.toString();

        if (!taskId) {
            console.error('Missing task ID in notification');
            return;
        }

        if (actionIdentifier === 'delete') {
            setPendingTaskId(taskId);
            Linking.openURL('yourapp://');
        } else if (actionIdentifier === 'show') {
            onShow();
        }
    };

    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            if (event.url.includes('/delete/')) {
                const taskId = event.url.split('/delete/')[1];
                taskId && setPendingTaskId(taskId);
            }
        };

        const deepLinkSubscription = Linking.addEventListener('url', handleDeepLink);
        
        const notificationSubscription = Notifications
            .addNotificationResponseReceivedListener(handleNotificationAction);

        Notifications.getLastNotificationResponseAsync()
            .then(response => response && handleNotificationAction(response));

        return () => {
            deepLinkSubscription.remove();
            notificationSubscription.remove();
        };
    }, []);

    const scheduleNotification = async (
        taskId: string,
        taskTitle: string,
        date: Date
    ) => {
        try {
            return await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Нагадування: ${taskTitle}`,
                    body: "Час виконати завдання!",
                    categoryIdentifier: "myCategory",
                    data: { 
                        id: taskId,
                        deepLink: `yourapp://delete/${taskId}`
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date,
                },
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    };

    return { scheduleNotification };
}

export default useNotifications;