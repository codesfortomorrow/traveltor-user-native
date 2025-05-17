import React, {useEffect, useState} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';

const ReviewCheckIn = ({setReviewText}) => {
  const route = useRoute();
  const [reviewText, setLocalReviewText] = useState('');
  const isCheckIn = route.name?.includes('TrailpointCheckIn');

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem(
          isCheckIn ? 'trailpointDraft' : 'generalDraft',
        );
        if (savedDraft) {
          setLocalReviewText(savedDraft);
          setReviewText(savedDraft);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, [isCheckIn, setReviewText]);

  const handleTextChange = text => {
    setLocalReviewText(text);
    setReviewText(text);
    saveDraft(text);
  };

  const saveDraft = async text => {
    try {
      await AsyncStorage.setItem(
        isCheckIn ? 'trailpointDraft' : 'generalDraft',
        text,
      );
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Write a Caption, Review or Experience.."
        placeholderTextColor="#0000009A"
        style={styles.textInput}
        value={reviewText}
        onChangeText={handleTextChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#000000',
  },
});

export default ReviewCheckIn;
