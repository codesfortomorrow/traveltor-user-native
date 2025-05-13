import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import {useSelector} from 'react-redux';
import Backheading from '../../components/Mobile/Backheading';
import Toast from 'react-native-toast-message';

const Referral = () => {
  const [isOpen, setIsOpen] = useState(false);
  const baseUrl = process.env.BASE_URL;
  const {getReferralData} = useAuth();
  const user = useSelector(state => state?.user);
  const [earningData, setEarningData] = useState(null);
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [referral, setReferral] = useState([]);

  const handleCopy = () => {
    // dispatch(cleanSuccess());
    // dispatch(
    //   setSuccess({
    //     open: true,
    //     custom_message:
    //       ' Copied your Referral Code, better if you share the invite link directly.',
    //   }),
    // );
    Toast.show({
      type: 'success',
      text1:
        'Copied your Referral Code, better if you share the invite link directly.',
    });
  };

  const fetchEarning = useCallback(async page => {
    try {
      setIsLoading(true);
      const response = await getReferralData(page);
      if (response === '') {
        setEarningData(null);
      } else {
        setEarningData(response);
        if (response?.data) {
          setReferral(prev => [...prev, ...response?.data]);
          setHasMore(response?.data?.length == 10);
          setNoData(false);
          if (response?.data?.length == 0) {
            setNoData(true);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarning(pageNumber);
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
    if (!isLoading && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  }, [isLoading, hasMore, pageNumber]);

  return (
    <View style={styles.container}>
      <Backheading heading={'Referral & Bonus'} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
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
        <View style={styles.earningHeader}>
          <View>
            <Text style={styles.earningLabel}>Referral earning</Text>
            <Text style={styles.earningAmount}>
              {Number(earningData?.totalReferralEarning) || 0}{' '}
              <Text style={styles.earningUnit}>tvtor</Text>
            </Text>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome {user?.firstname},</Text>
          <View style={styles.referralCodeContainer}>
            <View style={styles.referralCodeContent}>
              <View style={styles.referralCodeTextContainer}>
                <Text style={styles.referralCodeText}>
                  {user?.meta?.referralCode}
                </Text>
                <View style={styles.referralCodeActions}>
                  {/* <CopyToClipboard
                    text={user?.meta?.referralCode}
                    onCopy={handleCopy}>
                    {reactIcons.copy}
                  </CopyToClipboard> */}
                  <TouchableOpacity onPress={() => setIsOpen(true)}>
                    {/* {reactIcons.share} */}
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.referralInviteText}>
                Invite your friends to join the traveltor! For every friend you
                refer, both of you earn tvtor tokens.
              </Text>
            </View>
            <View style={styles.referralCountContainer}>
              <Text style={styles.referralCountNumber}>
                {earningData?.count || 0}
              </Text>
              <Text style={styles.referralCountText}>
                People joined using code
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.recentEarningsTitle}>Recent Referral Earnings</Text>

        {referral?.map((_item, index) => (
          <View key={index} style={styles.earningItemContainer}>
            <View style={styles.earningAmountCircle}>
              <Text style={styles.earningAmountText}>{_item?.amount}</Text>
            </View>
            <View>
              <Text style={styles.earningDescription}>
                {_item?.narration
                  ? _item?.narration
                  : `You've earned ${_item?.amount} TVTOR for referring!`}
              </Text>
              <View style={styles.earningTimeContainer}>
                <Text style={styles.earningTimeText}>
                  {moment(_item?.timestamp).format('DD/MM/YYYY hh:mm A')}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {noData && <Text style={styles.noDataText}>Data not available</Text>}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e93c00" />
          </View>
        )}

        <View ref={loader} style={styles.loaderRef} />
      </ScrollView>

      {/* <Social
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        setOpen={setIsOpen}
        code={baseUrl + '/referral/' + user?.meta?.referralCode}
        title="Here&apas;s my Traveltor referral code! Sign up now and enjoy exciting rewards on joining."
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '95%',
  },
  scrollContainer: {
    paddingBottom: 30,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  earningLabel: {
    fontSize: 10,
    fontWeight: '300',
  },
  earningAmount: {
    color: '#primary-1200',
    fontWeight: 'bold',
    fontSize: 24,
  },
  earningUnit: {
    fontSize: 10,
  },
  welcomeSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#8B8282',
    paddingBottom: 28,
    marginHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 4,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    backgroundColor: '#e93c00', // Approximating gradient
    borderRadius: 10,
  },
  referralCodeContent: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: 'white',
    padding: 8,
    paddingTop: 16,
    paddingBottom: 12,
  },
  referralCodeTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  referralCodeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  referralCodeActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    fontSize: 18,
  },
  referralInviteText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'white',
    marginTop: 16,
  },
  referralCountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  referralCountNumber: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  referralCountText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  recentEarningsTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginVertical: 28,
    paddingHorizontal: 20,
  },
  earningItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,208,191,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  earningAmountCircle: {
    backgroundColor: '#primary-1200',
    padding: 10,
    borderRadius: 50,
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningAmountText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
  },
  earningDescription: {
    fontSize: 14,
    fontWeight: '300',
  },
  earningTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningTimeText: {
    fontSize: 10,
    fontWeight: '300',
    textTransform: 'capitalize',
  },
  noDataText: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loaderRef: {
    height: 100,
  },
});

export default Referral;
