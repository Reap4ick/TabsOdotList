// import React from 'react'
// import { Alert, Button, StyleSheet, Text, View } from 'react-native'
// import * as Notifications from 'expo-notifications';
// import { SchedulableTriggerInputTypes } from 'expo-notifications';



// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: true,
//     }),
// });

// Notifications.setNotificationCategoryAsync('myCategory', [
//     {
//         buttonTitle: "Hello",
//         identifier: 'hello'
//     },
//     {
//         buttonTitle: "Ignore",
//         identifier: "ignore",
//         options: {
//             isDestructive: true
//         }
//     }
// ]);

// const notificationListener = Notifications.addNotificationResponseReceivedListener((res) => {
//     Alert.alert("Id:", res.actionIdentifier);
//     Alert.alert("Data: ", res.notification.request.content.data.senderName)
// });

// const service = {
//     nofity() {
//         Notifications.scheduleNotificationAsync({
//             content: {
//                 title: 'Look at that notification',
//                 body: "I'm so proud of myself!",
//             },
//             // trigger: null, // notify now
//             trigger: {
//                 type: SchedulableTriggerInputTypes.DATE,
//                 date: new Date(2025, 2, 24, 22, 42)
//             },
//         });
//     },
//     scheduleNofity() {
//         return Notifications.scheduleNotificationAsync({
//             content: {
//                 title: 'Look at that notification',
//                 body: "I'm so proud of myself!",
//             },
//             trigger: {
//                 type: SchedulableTriggerInputTypes.TIME_INTERVAL,
//                 seconds: 4,
//             },
//         });
//     },
//     async cancel(id: string) {
//         await Notifications.cancelScheduledNotificationAsync(id);
//     },
//     notificationWithActions() {
//         Notifications.scheduleNotificationAsync({
//             content: {
//                 title: 'Look at that notification',
//                 body: "I'm so proud of myself!",
//                 categoryIdentifier: "myCategory",
//                 data: {
//                     dialogId: 33,
//                     senderName: "Oleg"
//                 }
//             },
//             trigger: null, // notify now,
//         });
//     }
// }

// const NotifyExample = () => {
//     let id: string = "";

//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>Notifications Example</Text>
//             <Button title='Notify Now!' onPress={service.nofity} />
//             <Button title='Schedule Notification!' onPress={async () => id = await service.scheduleNofity()} />
//             <Button title='Cancel Scheduled Notification!' onPress={() => service.cancel(id)} />

//             <Button title='Notification with Actions!' onPress={() => Notifications.cancelAllScheduledNotificationsAsync()} />
//         </View>
//     )
// }

// export default NotifyExample

// const styles = StyleSheet.create({
//     container: {
//         display: 'flex',
//         justifyContent: "center",
//         alignItems: 'center',
//         marginTop: 20,
//         gap: 10
//     },
//     text: {
//         color: 'black',
//         fontSize: 18,
//         textAlign: 'center'
//     },
// })