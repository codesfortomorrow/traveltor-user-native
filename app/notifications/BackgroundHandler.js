import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

export const setBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📩 Background FCM message:', remoteMessage);

    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

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
