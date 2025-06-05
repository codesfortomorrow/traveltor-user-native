// src/firebase/notificationBackgroundEventHandler.js
import {EventType} from '@notifee/react-native';
import {navigate} from './RootNavigation';

export async function onBackgroundEventHandler({type, detail}) {
  if (type === EventType.PRESS) {
    const data = detail?.notification?.data;

    if (data?.type === 'check-in') {
      navigate('SingleCheckIn', {feedId: data?.id});
    } else if (data?.type === 'trekscape') {
      navigate('Trekscapes', {slug: data?.slug});
    } else if (['User', 'Trailblazer', 'Alphinist'].includes(data?.type)) {
      navigate('Profile', {userType: data?.type, id: data?.id});
    } else {
      navigate('Trekscapes');
    }
  }
}
