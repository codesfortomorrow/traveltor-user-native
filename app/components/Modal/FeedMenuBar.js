import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Linking,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {Menu} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import {postAuthReq} from '../../utils/apiHandlers';
import FeedDot from 'react-native-vector-icons/Entypo';

const FeedMenuBar = ({
  feed,
  setIsShoutOut,
  setShoutOutFeed,
  setIsDeleteModal,
  setFeedId,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useSelector(state => state?.user);
  const route = useRoute();
  const isProfile = route.name === 'Profile' && route.params?.id === user?.id;
  const [locationAllow, setLocationAllow] = useState(feed?.isShareable);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (feed?.isShareable && user?.id !== feed?.userId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      opacityAnim.setValue(1);
    }

    return () => {
      opacityAnim.stopAnimation();
    };
  }, [feed?.isShareable, user?.id, feed?.userId]);

  const postShareable = async () => {
    const res = await postAuthReq(`/check-ins/users/${feed?.id}/is-shareable`);
    if (res?.status) {
      setLocationAllow(prev => !prev);
      setMenuVisible(false);
    } else {
      console.log(res?.error);
    }
  };

  const letsGoOnMap = (lat, long) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${long}`;
    Linking.openURL(googleMapsUrl);
    setMenuVisible(false);
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      contentStyle={{paddingVertical: 0, backgroundColor: 'white'}}
      anchor={
        <TouchableWithoutFeedback onPress={() => setMenuVisible(true)}>
          <Animated.View style={{opacity: opacityAnim}}>
            <FeedDot name="dots-three-vertical" color="#000" size={14} />
          </Animated.View>
        </TouchableWithoutFeedback>
      }
      style={styles.menuContainer}>
      {user?.id === feed?.userId ? (
        <Menu.Item
          onPress={postShareable}
          title={`${locationAllow ? 'Disable' : 'Enable'} Post Location`}
          titleStyle={{fontSize: 14}}
        />
      ) : (
        (feed?.isShareable || feed?.isEvent) && (
          <Menu.Item
            onPress={() => letsGoOnMap(feed?.lat, feed?.long)}
            title="Let's go"
            titleStyle={{fontSize: 14}}
          />
        )
      )}

      {user?.id !== feed?.userId && !feed?.isEvent && (
        <Menu.Item
          onPress={() => {
            setIsShoutOut(true);
            setShoutOutFeed(feed);
            setMenuVisible(false);
          }}
          title="Shout-out"
          titleStyle={{fontSize: 14}}
        />
      )}

      {isProfile && (
        <Menu.Item
          onPress={() => {
            setFeedId(feed?.id);
            setIsDeleteModal(true);
            setMenuVisible(false);
          }}
          title="Delete"
          titleStyle={{fontSize: 14}}
        />
      )}
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: 'white',
    elevation: 4,
  },
});

export default FeedMenuBar;
