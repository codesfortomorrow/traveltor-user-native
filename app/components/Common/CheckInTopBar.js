import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Compass} from 'react-native-feather';
import Icon from 'react-native-vector-icons/Ionicons';

const CheckInTopBar = ({
  disable,
  handleCheckInTreckScape,
  text = 'Check In',
  setStep,
  trigger = 'Publish',
  isCropOpen = false,
  setIsCropOpen,
  type,
  setShowSingleFile,
  selectedFiles,
  nextTrip = false,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => {
            if (isCropOpen) {
              setIsCropOpen(false);
              setShowSingleFile('');
            } else if (text === 'Back' && type === 'trailpoint') {
              setStep(2);
            } else if (text === 'Back') {
              setStep(1);
            } else {
              navigation.goBack();
            }
          }}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{text}</Text>
      </View>

      {/* {nextTrip && selectedFiles?.length == 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('NearbyPlaces')}
          style={styles.nearbyButton}>
          <Compass width={18} height={18} color="#e93c00" />
          <Text style={styles.nearbyText}>Nearby Destinations</Text>
        </TouchableOpacity>
      )} */}

      {/* {selectedFiles?.length !== 0 && ( */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          disabled={disable}
          style={[styles.actionButton, disable && styles.disabledButton]}
          onPress={() => {
            if (isCropOpen) {
              setIsCropOpen(false);
              setShowSingleFile('');
            } else if (trigger === 'Next' && type === 'trailpoint') {
              setStep(3);
            } else if (trigger === 'Next') {
              setStep(2);
            } else {
              handleCheckInTreckScape();
            }
          }}>
          <Text style={styles.actionButtonText}>
            {isCropOpen ? 'Done' : trigger}
          </Text>
        </TouchableOpacity>
      </View>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: 'white',
    height: 50,
    zIndex: 100,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nearbyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 42,
    borderRadius: 10,
  },
  actionButton: {
    backgroundColor: '#e93c00',
    height: '100%',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    width: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'center',
  },
});

export default CheckInTopBar;
