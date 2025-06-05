import React, {useContext, useEffect, useState} from 'react';
import {TouchableOpacity, Image, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AuthContext} from '../../context/AuthContext';
import {getUser} from '../../redux/Slices/userSlice';
import ReactionCounter from '../Modal/ReactionCounter';
import {getAuthReq} from '../../utils/apiHandlers';
import {setBadge} from '../../redux/Slices/badgeCount';
import NotificationWithBadge from '../Comment/NotificationWithBadge';

const Header = () => {
  const {navigate} = useNavigation();
  const dispatch = useDispatch();
  const [data, setData] = useState({});
  const [showTooltip, setShowTooltip] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const {isLoggedIn} = useContext(AuthContext);

  useEffect(() => {
    dispatch(getUser(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCounts = async () => {
      const res = await getAuthReq('/notifications/count');
      if (
        res?.status &&
        (res?.data?.mustGo > 0 ||
          res?.data?.comment > 0 ||
          res?.data?.newFollower > 0)
      ) {
        setData(res?.data);
        const badgeCount =
          res?.data?.mustGo + res?.data?.comment + res?.data?.newFollower;
        dispatch(setBadge(badgeCount));

        setShowTooltip(true);

        setTimeout(() => setAnimateIn(true), 50);

        setTimeout(() => setAnimateOut(true), 4500);

        setTimeout(() => {
          setShowTooltip(false);
          setAnimateIn(false);
          setAnimateOut(false);
        }, 5000);
      }
    };

    fetchCounts();
  }, []);

  return (
    <View style={style.container}>
      <Image
        style={{width: 200, height: 50, resizeMode: 'contain'}}
        source={require('../../../public/images/logo-1.png')}
      />
      {isLoggedIn && (
        <TouchableOpacity
          onPress={() => navigate('Notification')}
          style={{position: 'relative'}}>
          <NotificationWithBadge
            badgeCount={Math.min(
              data.mustGo + data.comment + data.newFollower,
              999,
            )}
          />
          {(data?.mustGo || data?.comment || data?.newFollower) &&
            showTooltip && (
              <ReactionCounter
                data={data}
                animateOut={animateOut}
                animateIn={animateIn}
              />
            )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
