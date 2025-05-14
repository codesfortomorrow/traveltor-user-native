import React from 'react';
import {View, StyleSheet} from 'react-native';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';

const FeedLoader = () => {
  // Create an array with 5 elements to render 5 skeleton items
  return (
    <>
      {Array.from({length: 5}).map((_, index) => (
        <View key={index}>
          {/* Header with profile and time */}
          <View style={styles.headerContainer}>
            <View style={styles.profileContainer}>
              {/* Profile picture skeleton */}
              <ContentLoader
                speed={2}
                width={50}
                height={50}
                viewBox="0 0 50 50"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Circle cx="25" cy="25" r="25" />
              </ContentLoader>

              <View>
                {/* Username skeleton */}
                <ContentLoader
                  speed={2}
                  width={120}
                  height={14}
                  viewBox="0 0 120 14"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  style={styles.usernameSkeleton}>
                  <Rect x="0" y="0" rx="3" ry="3" width="120" height="14" />
                </ContentLoader>

                {/* Location and time info skeleton */}
                <View style={styles.locationContainer}>
                  <ContentLoader
                    speed={2}
                    width={15}
                    height={15}
                    viewBox="0 0 15 15"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb">
                    <Rect x="0" y="0" rx="3" ry="3" width="15" height="15" />
                  </ContentLoader>

                  <ContentLoader
                    speed={2}
                    width={140}
                    height={12}
                    viewBox="0 0 140 12"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={styles.locationText}>
                    <Rect x="0" y="0" rx="3" ry="3" width="140" height="12" />
                  </ContentLoader>
                </View>
              </View>
            </View>

            {/* Time indicator skeleton */}
            <ContentLoader
              speed={2}
              width={25}
              height={12}
              viewBox="0 0 25 12"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="3" ry="3" width="25" height="12" />
            </ContentLoader>
          </View>

          {/* Image skeleton */}
          <View style={styles.imageContainer}>
            <ContentLoader
              speed={2}
              width="100%"
              height={260}
              viewBox="0 0 400 260"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="3" ry="3" width="100%" height="260" />
            </ContentLoader>
          </View>

          {/* Caption skeleton */}
          <View style={styles.captionContainer}>
            <ContentLoader
              speed={2}
              width="40%"
              height={12}
              viewBox="0 0 160 12"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="0" y="0" rx="3" ry="3" width="160" height="12" />
            </ContentLoader>
          </View>

          {/* Action buttons skeleton */}
          <View style={styles.actionsContainer}>
            <View style={styles.actionLeft}>
              <ContentLoader
                speed={2}
                width={20}
                height={20}
                viewBox="0 0 20 20"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="20" height="20" />
              </ContentLoader>

              <ContentLoader
                speed={2}
                width={50}
                height={10}
                viewBox="0 0 50 10"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="50" height="10" />
              </ContentLoader>

              <ContentLoader
                speed={2}
                width={40}
                height={10}
                viewBox="0 0 40 10"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="40" height="10" />
              </ContentLoader>
            </View>

            <View style={styles.actionRight}>
              <ContentLoader
                speed={2}
                width={20}
                height={20}
                viewBox="0 0 20 20"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="20" height="20" />
              </ContentLoader>

              <ContentLoader
                speed={2}
                width={50}
                height={10}
                viewBox="0 0 50 10"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="50" height="10" />
              </ContentLoader>

              <ContentLoader
                speed={2}
                width={40}
                height={10}
                viewBox="0 0 40 10"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb">
                <Rect x="0" y="0" rx="3" ry="3" width="40" height="10" />
              </ContentLoader>
            </View>
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  usernameSkeleton: {
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    marginLeft: 4,
  },
  imageContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 0,
  },
  captionContainer: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingLeft: 20,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 20,
  },
});

export default FeedLoader;
