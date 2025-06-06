import React from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import Toast from 'react-native-toast-message';
import BellIcon from '../../../public/images/bellIcon.svg';
import {useSelector} from 'react-redux';
import {navigate} from '../../notifications/RootNavigation';

export const showForegroundToast = (payload, user) => {
  Toast.show({
    type: 'customNotification',
    props: {
      payload,
      user,
    },
    position: 'top',
    autoHide: true,
    topOffset: 10,
    visibilityTime: 3000,
  });
};

function stripHtml(html) {
  if (!html) return '';

  let text = html.replace(/<\/?[^>]+(>|$)/g, '');

  const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',
  };

  return text.replace(
    /&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&nbsp;/g,
    match => entityMap[match],
  );
}

const ForegroundToast = ({payload}) => {
  const user = useSelector(state => state?.user);

  const url = process.env.CHECK_URL || process.env.API_URL;

  const handleClick = () => {
    const {title, id, link, slug, type} = payload?.data;
    Toast.hide();

    const profileNavigation = () =>
      navigate('Profile', {id: id || user?.id, userType: 'User'});

    if (type === 'check-in') {
      navigate('SingleCheckIn', {feedId: id});
      return;
    }

    switch (title) {
      case 'Welcome':
        profileNavigation();
        break;
      case 'Location Validated':
        navigate('TrailpointReview', {slug});
        break;
      case 'New Follower':
        profileNavigation();
        break;
      case 'Bonus':
        navigate('Referral');
        break;
      default:
        if (link) {
          if (link.startsWith(url)) {
            const path = link.replace(url, '');
            navigate(path);
          } else {
            Linking.openURL(link);
          }
        }
    }
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
