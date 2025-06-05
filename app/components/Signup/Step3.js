import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const Step3 = ({step3open, handleCloseStep3}) => {
  return (
    <Modal
      visible={step3open}
      transparent
      animationType="fade"
      onRequestClose={handleCloseStep3}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.heading}>Welcome to Traveltor</Text>
            <View style={styles.gradientLine} />
          </View>

          <View style={styles.centerContent}>
            <Image
              source={require('../../../public/images/logo-1.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.subHeading}>Explore the World with Us</Text>
          </View>

          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Embark on a journey that celebrates every step, validates your
              path, and inspires others to embrace the spirit of authentic
              adventure. With every trail you conquer and every milestone
              achieved, you're fueling a passion for exploration that is
              accompanied by many rewards.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleCloseStep3}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Step3;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 10,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    padding: 8,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 8,
    textAlign: 'center',
  },
  gradientLine: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.23)',
    marginTop: 4,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  logoImage: {
    width: 220,
    height: 50,
    resizeMode: 'cover',
  },
  subHeading: {
    fontSize: 20,
    textAlign: 'center',
  },
  description: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  buttonContainer: {
    width: '95%',
    marginTop: 20,
  },
  closeButton: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e93c00',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
  },
});
