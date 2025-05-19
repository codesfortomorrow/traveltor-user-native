import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';

export const useNotificationRedirect = () => {
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Opened from background state:', remoteMessage);
      // handleNavigation(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Opened from quit state:', remoteMessage);
          // handleNavigation(remoteMessage);
        }
      });
  }, []);

  // const handleNavigation = remoteMessage => {
  //   const data = remoteMessage?.data;
  //   if (data?.screen) {
  //     navigation.navigate(data.screen, {id: data.id});
  //   }
  // };
};
