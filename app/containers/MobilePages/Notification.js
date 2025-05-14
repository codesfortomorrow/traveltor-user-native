import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import {patchApiReq} from '../../utils/apiHandlers';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import Backheading from '../../components/Mobile/Backheading';
import TimerOutline from 'react-native-vector-icons/Ionicons';
import BellIcon from 'react-native-vector-icons/FontAwesome';

const Notification = () => {
  const {getNotification} = useAuth();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [noData, setNoData] = useState(false);
  const loader = useRef(null);
  const {navigate} = useNavigation();
  const url = process.env.CHECK_URL || process.env.API_URL;

  const fetchTrailpointDetail = useCallback(async page => {
    setLoading(true);
    try {
      const response = await getNotification(Number(page));
      if (response) {
        setNotification(prev => [...prev, ...response?.data]);
        setHasMore(response.data.length === 50);
      }
      setNoData(true);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrailpointDetail(pageNumber);
  }, [pageNumber]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPageNumber(prev => prev + 1);
    }
  };

  const notifyRedirection = item => {
    switch (item?.data?.type || item?.title) {
      case 'trail-point':
        return `/trailpoint/${item?.data?.slug}`;
      case 'check-in':
        return `/checkin/${item?.data?.id}`;
      case 'trekscape':
        return `/trekscape/${item?.data?.slug}`;
      case 'User':
        return `/user/profile/${item?.data?.id}`;
      case 'Trailblazer':
        return `/trailblazer/profile/${item?.data?.id}`;
      case 'Location enabled':
        return `/checkin/${item?.data?.id}`;
    }
  };

  const notifyRead = async () => {
    const res = await patchApiReq('/notifications');
    if (res?.status) {
      return;
    } else {
      console.log('failed to read notify');
    }
  };

  useEffect(() => {
    if (notification.length > 0 && !pageNumber) {
      notifyRead();
    }
  }, [notification, pageNumber]);

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

  const handleItemPress = item => {
    if (item?.link) {
      if (item.link.startsWith(url)) {
        const relativePath = item.link.replace(url, '');
        navigate(relativePath);
      } else {
        Linking.openURL(item.link);
      }
    } else {
      const redirection = notifyRedirection(item);
      navigate(redirection);
    }
  };

  const renderNotificationItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => handleItemPress(item)}>
        <View style={styles.iconContainer}>
          {/* Replace with appropriate React Native Icon component */}
          <Text style={styles.iconText}>🔔</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{item?.title}</Text>
          <Text style={styles.bodyText}>{stripHtml(item?.body)}</Text>
        </View>
        <View style={styles.timeContainer}>
          <TimerOutline name="timer-outline" size={13} color="#000" />
          <Text style={styles.timeText}>
            {moment(item?.createdAt).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (noData) {
      return (
        <View style={styles.emptyContainer}>
          <BellIcon name="bell" size={40} color="#000" />
          <Text style={styles.emptyText}>
            Wow, such peace! No notifications to disturb your zen moment. 🧘‍♂️
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E93C00" />
        </View>
      );
    }
    return <View style={styles.footerSpace} />;
  };

  return (
    <View style={styles.container}>
      <Backheading heading={'Notifications'} />

      <FlatList
        data={notification}
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Inter',
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    position: 'relative',
  },
  iconContainer: {
    backgroundColor: '#FCE6DE',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    height: 56,
    width: 56,
  },
  iconText: {
    fontSize: 26,
  },
  contentContainer: {
    width: '70%',
    marginLeft: 12,
  },
  titleText: {
    color: '#E93C00',
    fontWeight: '600',
    fontSize: 12,
    width: 185,
  },
  bodyText: {
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 22,
  },
  timeText: {
    fontWeight: '300',
    fontSize: 10,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    height: 400,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerSpace: {
    height: 100,
  },
});

export default Notification;
