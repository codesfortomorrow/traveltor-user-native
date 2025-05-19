import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {showForegroundToast} from '../components/FirebaseToaster/ForegroundToast';
// import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

export const useForegroundNotification = () => {
  // const navigation = useNavigation();
  const user = useSelector(state => state?.user);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage);
      showForegroundToast(remoteMessage, user);
    });

    return unsubscribe;
  }, []);
};
