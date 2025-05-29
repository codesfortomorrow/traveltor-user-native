import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;

const SkeletonLoader = ({width, height, borderRadius = 0, style = {}}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E1E9EE',
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const TrekscapeDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Cover Image Skeleton */}
      <View style={styles.relative}>
        <SkeletonLoader width="100%" height={225} />

        {/* Details Box Skeleton */}
        <View style={styles.detailsBox}>
          {/* Header Row Skeleton */}
          <View style={styles.headerRow}>
            <SkeletonLoader width={120} height={18} />
            <View style={styles.actionButtons}>
              <SkeletonLoader width={75} height={32} borderRadius={8} />
              <SkeletonLoader width={32} height={32} borderRadius={8} />
            </View>
          </View>

          {/* Stats Row Skeleton */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <SkeletonLoader width={15} height={15} />
              <SkeletonLoader width={80} height={12} />
            </View>
            <View style={styles.statItem}>
              <SkeletonLoader width={15} height={15} />
              <SkeletonLoader width={70} height={12} />
            </View>
            <View style={styles.statItem}>
              <SkeletonLoader width={15} height={15} />
              <SkeletonLoader width={60} height={12} />
            </View>
          </View>
        </View>
      </View>

      {/* Trail Points Container Skeleton */}
      <View style={styles.trailPointsContainer}>
        {Array.from({length: 4}).map((_, index) => (
          <View key={index} style={styles.trailPointCard}>
            {/* Trail Point Image Skeleton */}
            <SkeletonLoader width={90} height={94} borderRadius={10} />

            {/* Trail Point Content Skeleton */}
            <View style={styles.trailPointContent}>
              <View style={styles.flex1}>
                {/* Title Skeleton */}
                <SkeletonLoader width={140} height={16} style={styles.mb12} />

                {/* Map Link Skeleton */}
                <View style={[styles.statItem, styles.mb12]}>
                  <SkeletonLoader width={20} height={20} />
                  <SkeletonLoader width={80} height={12} />
                </View>

                {/* Reviews Skeleton */}
                <View style={[styles.statItem, styles.mb12]}>
                  <SkeletonLoader width={20} height={20} />
                  <SkeletonLoader width={70} height={12} />
                </View>
              </View>

              {/* Action Container Skeleton */}
              <View style={styles.actionContainer}>
                <SkeletonLoader width={28} height={28} borderRadius={14} />
                <SkeletonLoader width={50} height={8} style={{marginTop: 4}} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  relative: {
    position: 'relative',
  },
  detailsBox: {
    position: 'absolute',
    bottom: -24,
    left: '2%',
    right: '2%',
    width: '96%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trailPointsContainer: {
    marginTop: 40,
    marginHorizontal: 10,
    marginBottom: 70,
  },
  trailPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FCF2EE59',
    borderRadius: 15,
    padding: 8,
    marginBottom: 16,
  },
  trailPointContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  mb12: {
    marginBottom: 12,
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

export default TrekscapeDetailsSkeleton;
