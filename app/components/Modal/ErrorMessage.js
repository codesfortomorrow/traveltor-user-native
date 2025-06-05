import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {cleanError} from '../../redux/Slices/errorPopup';

const ErrorMessage = () => {
  const dispatch = useDispatch();
  const errorObject = useSelector(state => state?.errorModule);

  const [open, setOpen] = useState(errorObject?.open);
  const [customMessage, setCustomMessage] = useState(
    errorObject?.custom_message,
  );
  const [sorry, setSorry] = useState(errorObject?.sorryMsg);
  const [errorMsg, setErrorMsg] = useState(errorObject?.errorMsg);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setOpen(errorObject.open);
    setCustomMessage(errorObject.custom_message);
    setSorry(errorObject.sorryMsg);
    setErrorMsg(errorObject.errorMsg);
    if (errorObject.open == true) {
      setCounter(5);
      setTimeout(() => {
        dispatch(cleanError());
      }, [5000]);
    }
  }, [errorObject]);

  useEffect(() => {
    if (counter > 0) {
      const p = setInterval(() => {
        if (counter - 1 == 0) {
          clearInterval(p);
        } else {
          setCounter(counter => counter - 1);
        }
      }, [1000]);
      return () => clearInterval(p);
    }
  }, [counter]);

  const handleCloseModal = () => {
    dispatch(cleanError());
  };

  return (
    <Modal
      visible={open}
      onRequestClose={handleCloseModal}
      transparent
      animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.contentContainer}>
            <Image
              source={require('../../../public/images/popup/failureBg.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.contentWrapper}>
              <View style={styles.headerContainer}>
                {!errorMsg && (
                  <Image
                    source={require('../../../public/favicon-32x32.png')}
                    style={styles.iconImage}
                  />
                )}
                <Text
                  style={[
                    styles.titleText,
                    sorry ? styles.sorryText : styles.updateText,
                  ]}>
                  {sorry ? 'Sooo Sorry!!!' : 'Stay Updated'}
                </Text>
              </View>

              <Text style={styles.messageText}>
                {errorMsg ? 'Error' : 'Re Login Required'} : {customMessage}
              </Text>

              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.counterText}>
                This Popup will be auto close in {counter} Seconds.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modalContent: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    width: '95%',
    height: '50%',
    // Add shadow properties for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Add elevation for Android
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  contentWrapper: {
    zIndex: 2,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconImage: {
    width: 40,
    height: 40,
    marginTop: 30,
  },
  titleText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingBottom: 20,
    marginTop: 56,
    fontFamily: 'Inter',
  },
  sorryText: {
    fontSize: 36,
  },
  updateText: {
    fontSize: 20,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    fontFamily: 'Inter',
    color: 'black',
    marginBottom: 50,
  },
  closeButton: {
    backgroundColor: '#e93c00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  counterText: {
    fontSize: 10,
  },
});

export default ErrorMessage;
