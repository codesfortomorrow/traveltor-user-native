import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {cleanSuccess} from '../../redux/Slices/successPopup';
import {useDispatch, useSelector} from 'react-redux';
import CongratsIcon from '../../../public/images/popup/congratsIcon.svg';

const SuccessMessage = () => {
  const dispatch = useDispatch();
  const successObject = useSelector(state => state?.successModule);
  const [open, setOpen] = useState(successObject?.open);
  const [defaultMsg, setDefaultMsg] = useState(successObject?.defaultMsg);
  const [customMessage, setCustomMessage] = useState(
    successObject?.custom_message,
  );
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setOpen(successObject.open);
    setCustomMessage(successObject.custom_message);
    setDefaultMsg(successObject.defaultMsg);
    if (successObject.open == true) {
      setCounter(5);
      setTimeout(() => {
        dispatch(cleanSuccess());
      }, 5000);
    }
  }, [successObject]);

  useEffect(() => {
    if (counter > 0) {
      const p = setInterval(() => {
        if (counter - 1 == 0) {
          clearInterval(p);
        } else {
          setCounter(counter => counter - 1);
        }
      }, 1000);
      return () => clearInterval(p);
    }
  }, [counter]);

  const handleCloseModal = () => {
    dispatch(cleanSuccess());
  };

  return (
    <Modal
      visible={open}
      onRequestClose={handleCloseModal}
      transparent
      animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Image
            source={require('../../../public/images/popup/congratsBg.png')}
            style={styles.backgroundImage}
          />
          <View style={styles.contentContainer}>
            <CongratsIcon width={150} height={150} />
            <Text style={styles.titleText}>Congratulations!!!</Text>

            <Text style={styles.messageText}>
              {defaultMsg && 'You have successfully'} {customMessage}
            </Text>

            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.counterText}>
              This Popup will be auto close in {counter} Seconds.
            </Text>
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
  modalContent: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    width: '95%',
    height: '50%',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  contentContainer: {
    zIndex: 2,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  iconImage: {
    height: 90,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter',
    color: 'black',
    paddingBottom: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
    fontFamily: 'Inter',
    color: 'black',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#e93c00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  counterText: {
    fontSize: 10,
  },
});

export default SuccessMessage;
