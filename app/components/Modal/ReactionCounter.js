import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Heart from 'react-native-vector-icons/AntDesign';
import Comment from 'react-native-vector-icons/FontAwesome';
import User from 'react-native-vector-icons/Entypo';

const ReactionCounter = ({data, animateIn, animateOut}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (animateIn && !animateOut) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (animateOut) {
      // Animate out
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateIn, animateOut, opacityAnim, scaleAnim]);

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{scale: scaleAnim}],
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Arrow pointer */}
      <View style={styles.arrow} />

      <View style={styles.content}>
        {data?.mustGo > 0 && (
          <View style={styles.reactionItem}>
            <Heart
              name="heart"
              style={{marginLeft: 10}}
              size={16}
              color="white"
            />
            <Text style={[styles.reactionText, {marginRight: 10}]}>
              {data.mustGo}
            </Text>
          </View>
        )}

        {data?.comment > 0 && (
          <View style={styles.reactionItem}>
            <Comment
              name="comment"
              style={{marginLeft: data?.mustGo == 0 ? 10 : 0}}
              size={16}
              color="white"
            />
            <Text style={[styles.reactionText, {marginRight: 10}]}>
              {data.comment}
            </Text>
          </View>
        )}

        {data?.newFollower > 0 && (
          <View style={styles.reactionItem}>
            <User
              name="user"
              size={16}
              style={{
                marginLeft: data?.mustGo == 0 && data?.comment == 0 ? 10 : 0,
              }}
              color="white"
            />
            <Text style={[styles.reactionText, {marginRight: 10}]}>
              {data.newFollower}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 38,
    right: -12,
    backgroundColor: '#e93c00',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 20,
    paddingVertical: 12,
    transformOrigin: 'top right',
  },
  arrow: {
    position: 'absolute',
    top: -6,
    right: 19,
    width: 16,
    height: 16,
    backgroundColor: '#e93c00',
    transform: [{rotate: '45deg'}],
  },
  content: {
    flexDirection: 'row',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ReactionCounter;
