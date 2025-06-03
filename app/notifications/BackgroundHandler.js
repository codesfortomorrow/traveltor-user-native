// src/firebase/setBackgroundHandler.js
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

export const setBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📩 Background FCM message:', remoteMessage);

    // Optional: Create notification channel if not exists
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Display the notification manually (especially useful for data-only payloads)
    await notifee.displayNotification({
      title: remoteMessage.data?.title,
      body: remoteMessage.data?.body,
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
        sound: 'default',
      },
    });
  });
};
