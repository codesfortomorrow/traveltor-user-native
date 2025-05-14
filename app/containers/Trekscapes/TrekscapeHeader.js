import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Location from 'react-native-vector-icons/Ionicons';

const TrekscapeHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {slug} = route.params;
  const currentRouteName = route.name;

  const items = [
    {
      icon: <Location name="location-outline" size={24} color="#000" />,
      activeIcon: (
        <Location name="location-outline" size={24} color="#e93c00" />
      ),
      title: 'Trail Points',
      routeName: 'TrekscapeDetail',
    },
    {
      icon: <Location name="location-outline" size={24} color="#000" />,
      activeIcon: (
        <Location name="location-outline" size={24} color="#e93c00" />
      ),
      title: 'Feeds',
      routeName: 'TrekscapeFeed',
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          onPress={() => {
            navigation.navigate(item.routeName, {slug});
          }}>
          {item?.routeName === currentRouteName ? item?.activeIcon : item?.icon}
          <Text
            style={[
              styles.tabText,
              item.routeName === currentRouteName && styles.activeTabText,
            ]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 9,
    paddingBottom: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: 'black',
    fontFamily: 'Roboto',
  },
  activeTabText: {
    color: '#e93c00',
  },
});

export default TrekscapeHeader;
