import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationWithBadge = ({size = 30, badgeCount = 0}) => {
  const {navigate} = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigate('Notification')}
      style={{position: 'relative'}}>
      <Icon name="bell-ring-outline" size={size} color="black" />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationWithBadge;
