import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackAndHeading from '../../components/Mobile/Backheading';
import useAuth from '../../hooks/useAuth';
import AddWallet from '../../components/Modal/AddWallet';

const Wallet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [walletActivities, setWalletActivities] = useState([]);
  const [chainData, setChainData] = useState([]);
  const {getWalletTransaction} = useAuth();
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const user = useSelector(state => state?.user);
  const [copy, setCopy] = useState(false);
  const loader = useRef(null);

  const fetchWalletActivities = async page => {
    setLoading(true);
    const res = await getWalletTransaction(page);
    if (res?.data) {
      setWalletActivities(prev => [...prev, ...res.data]);
      setHasMore(res.data.length === 50);
      setChainData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWalletActivities(pageNumber);
  }, [pageNumber]);

  // Helper function to detect when scrolled to bottom
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 50;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // Replace IntersectionObserver with React Native's onEndReached for FlatList
  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  }, [loading, hasMore, pageNumber]);

  const handleCopy = text => {
    Clipboard.setString(text);
    setCopy(true);
    setTimeout(() => setCopy(false), 2000);
  };

  const capital = text => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const activitySwitch = item => {
    switch (item.context) {
      case 'ReferralBonus':
        return `You've earned ${item?.amount || 0} tvtor for referring ${
          capital(item?.referral?.firstname) || ''
        }.`;

      case 'CheckInBonus':
        return `You've earned ${
          item?.amount || 0
        } tvtor for your Check-In Bonus ${
          item.trailPoint?.name || item.trekscape?.name
            ? `at ${capital(item.trailPoint?.name || item.trekscape?.name)}`
            : ''
        }.`;

      case 'ReferrerCheckInBonus':
        return `You just received ${item?.amount || 0} tvtor for ${
          capital(item?.referral?.firstname) || ''
        } Check-In Bonus ${
          item.trailPoint?.name || item.trekscape?.name
            ? `at ${capital(item.trailPoint?.name || item.trekscape?.name)}`
            : ''
        }.`;

      case 'ReactionBonus':
        return `You've earned ${item?.amount || 0} tvtor for your reaction.`;

      case 'JoiningBonus':
        return `You've earned ${
          item?.amount || 0
        } tvtor as your joining bonus.`;
    }
  };

  return (
    <View style={styles.container}>
      <BackAndHeading heading={'Wallet & Earnings'} />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleEndReached();
          }
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleEndReached();
          }
        }}>
        <View style={styles.walletSection}>
          {user?.meta?.walletAddress ? (
            <View>
              <Text style={styles.connectedWalletText}>
                Your wallet is connected
              </Text>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletAddressText}>
                  {`${user?.meta?.walletAddress.slice(
                    0,
                    8,
                  )}...${user?.meta?.walletAddress.slice(-3)}`}
                </Text>
                {copy ? (
                  <MaterialIcons name="check" size={20} color="white" />
                ) : (
                  <TouchableOpacity
                    onPress={() => handleCopy(user?.meta?.walletAddress)}>
                    <Ionicons name="copy-outline" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectWalletButton}
              onPress={() => setIsOpen(true)}>
              <Text style={styles.connectWalletButtonText}>
                Connect Your wallet
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {user?.meta?.walletAddress && (
          <View style={styles.chainDataContainer}>
            <View style={styles.chainDataTextContainer}>
              <Text style={styles.chainDataText}>
                Offchain: {chainData?.offchain || 0} tvtor
              </Text>
              <Text style={styles.chainDataText}>
                Onchain: {chainData?.onchain || 0} tvtor
              </Text>
            </View>
            <View style={styles.divider} />
          </View>
        )}

        <View style={styles.walletActivityContainer}>
          <Text style={styles.walletActivityTitle}>Wallet Activity</Text>
          <View style={{flexDirection: 'column', gap: 10}}>
            {walletActivities?.map((track, index) => {
              const {type, timestamp} = track;
              const text = activitySwitch(track);
              return (
                <View key={index} style={styles.activityItemContainer}>
                  <Text style={styles.activityIndex}>{`${index + 1}.`}</Text>
                  <Text style={styles.activityText}>
                    {track?.narration?.length > 5 ? track?.narration : text}
                  </Text>
                  <View
                    style={[
                      styles.activityDateContainer,
                      {
                        backgroundColor:
                          type === 'Credit' ? '#11C939' : '#FF3E3E',
                        color: type === 'Credit' ? '#196B34' : '#fff',
                      },
                    ]}>
                    <View style={styles.activityDateLeft}>
                      <Text style={styles.activityDateMainText}>
                        {moment(timestamp).format('DD')}
                      </Text>
                      <View>
                        <Text style={styles.activityDateSmallText}>
                          {moment(timestamp).format('MMM')}
                        </Text>
                        <Text style={styles.activityDateSmallText}>
                          {moment(timestamp).format('YYYY')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.activityDateRight}>
                      <Text style={styles.activityDateSmallText}>
                        {moment(timestamp).format('HH:mm')}
                      </Text>
                      <Text style={styles.activityDateSmallText}>
                        {moment(timestamp).format('A')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E93C00" />
            </View>
          )}
          <View ref={loader} style={styles.loaderPlaceholder} />
        </View>
        <AddWallet open={isOpen} handleClose={() => setIsOpen(false)} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  walletSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  connectedWalletText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  walletAddressContainer: {
    backgroundColor: '#E93C00',
    color: 'white',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAddressText: {
    color: 'white',
    marginRight: 10,
  },
  connectWalletButton: {
    backgroundColor: '#E93C00',
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 8,
  },
  connectWalletButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  chainDataContainer: {
    paddingHorizontal: 20,
  },
  chainDataTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chainDataText: {
    fontSize: 13,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#878080',
  },
  walletActivityContainer: {
    paddingTop: 32,
  },
  walletActivityTitle: {
    fontSize: 24,
    fontWeight: 'normal',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF8F5',
  },
  activityIndex: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityText: {
    fontSize: 12,
    lineHeight: 22,
    flex: 1,
    marginHorizontal: 10,
  },
  activityDateContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 36,
    width: 101,
  },
  activityDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'white',
    paddingHorizontal: 8,
    width: '65%',
  },
  activityDateMainText: {
    fontSize: 24,
    color: 'white',
    marginRight: 5,
  },
  activityDateRight: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '35%',
  },
  activityDateSmallText: {
    fontSize: 8,
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    height: 60,
  },
  loaderPlaceholder: {
    height: 100,
  },
});

export default Wallet;
