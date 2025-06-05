import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SuccessIcon from '../../../public/images/successIcon.svg';

const {width, height} = Dimensions.get('window');

const CheckInSuccessPopup = ({open, handleClose, data}) => {
  return (
    <Modal
      visible={open}
      onRequestClose={handleClose}
      transparent
      animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.contentWrapper}>
            <Image
              source={require('../../../public/images/successCheckin1.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.contentContainer}>
              <Text style={styles.headerText}>WOHoo!!</Text>

              <View style={styles.iconContainer}>
                <SuccessIcon width={70} height={70} />
              </View>

              <Text style={styles.messageText}>
                You successfully Checked In at
                <Text style={styles.boldText}> {data?.name}</Text>
              </Text>

              <View style={styles.rewardContainer}>
                <Text style={styles.rewardText}>
                  "You earned{' '}
                  <Text style={styles.pointsText}>{data?.point} tvtor</Text> as
                  Reward."
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    height: '70%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  contentContainer: {
    zIndex: 2,
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
    paddingBottom: 56,
    gap: 20,
  },
  headerText: {
    fontSize: 55,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: 'white',
  },
  iconContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
  },
  successIcon: {
    height: 70,
    width: 70,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    fontFamily: 'Inter',
    color: 'white',
  },
  boldText: {
    fontWeight: 'bold',
  },
  rewardContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingTop: 4,
    borderColor: '#FFFFFF3B',
  },
  rewardText: {
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
    fontFamily: 'Jim',
    color: 'white',
  },
  pointsText: {
    fontSize: 30,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 15,
  },
  closeButtonText: {
    color: '#e93c00',
    fontWeight: '500',
    fontSize: 12,
  },
});

export default CheckInSuccessPopup;
