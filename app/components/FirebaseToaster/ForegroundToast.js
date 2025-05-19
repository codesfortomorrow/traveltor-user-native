// components/ForegroundToast.js
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import BellIcon from '../../../public/images/bellIcon.svg';
import {useSelector} from 'react-redux';

export const showForegroundToast = (payload, user) => {
  Toast.show({
    type: 'customNotification',
    props: {
      payload,
      user,
      //   navigate,
    },
    position: 'top',
    autoHide: true,
    topOffset: 10,
    visibilityTime: 3000,
  });
};

const ForegroundToast = ({payload}) => {
  console.log(payload, user, 'payload');
  const user = useSelector(state => state?.user);
  const stripHtml = (html = '') =>
    html.replace(/<\/?[^>]+(>|$)/g, '').replace(/&nbsp;/g, ' ');
  const url = process.env.CHECK_URL || process.env.API_URL;

  const handleClick = () => {
    const data = payload?.data;
    const link = data?.link;

    if (link) {
      if (link.startsWith(url)) {
        const path = link.replace(url, '');
        // navigate(path);
      } else {
        Linking.openURL(link);
      }
    } else {
      // Optional fallback
    }

    Toast.hide();
  };

  return (
    <TouchableOpacity
      onPress={handleClick}
      style={{
        backgroundColor: '#FFC6B2',
        marginHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}>
      <View
        style={{
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderRadius: 9999,
          flexShrink: 0,
        }}>
        <BellIcon />
      </View>
      <View style={{flex: 1}}>
        <Text style={{fontSize: 12}}>
          Hey <Text style={{fontWeight: 'bold'}}>{user?.firstname}</Text>
        </Text>
        <Text style={{fontSize: 12}}>{stripHtml(payload?.data?.body)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ForegroundToast;
