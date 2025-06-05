import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import {postAuthReq} from '../../utils/apiHandlers';
import ShoutLogo from '../../../public/images/shoutLogo.svg';

const ShoutOut = ({open, onClose, feed}) => {
  const [selected, setSelected] = useState(10);
  const [type, setType] = useState('wow');
  const [isShout, setIsShout] = useState(false);

  const giveShoutOut = async (checkInId, type) => {
    setIsShout(true);
    const res = await postAuthReq(`/check-ins/users/${checkInId}/shoutout`, {
      type,
    });
    if (res?.status) {
      onClose();
      setIsShout(false);
    } else {
      console.log('shoutOut failed err');
    }
  };

  const shoutOut = [
    {num: 10, type: 'wow'},
    {num: 20, type: 'stunning'},
    {num: 50, type: 'splendid'},
  ];

  return (
    <Modal
      visible={open}
      onRequestClose={onClose}
      transparent
      animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.logoContainer}>
            <ShoutLogo width={63} height={63} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              Shout-out to{' '}
              <Text style={styles.boldText}>
                {feed?.user?.firstname} {feed?.user?.lastname}
              </Text>
            </Text>
            <Text style={styles.subtitleText}>because you felt</Text>
          </View>

          <View style={styles.typesContainer}>
            <Text style={styles.typeLabel}>Wow</Text>
            <Text style={styles.typeLabel}>Stunning</Text>
            <Text style={styles.typeLabel}>Splendid</Text>
          </View>

          <View style={styles.shoutOptionsContainer}>
            {shoutOut?.map((shout, index) => (
              <View style={styles.shoutOptionItem} key={index}>
                <TouchableOpacity
                  style={[
                    styles.circleButton,
                    selected === shout.num && styles.selectedCircleButton,
                  ]}
                  onPress={() => {
                    setSelected(shout.num);
                    setType(shout.type);
                  }}>
                  <Text
                    style={[
                      styles.circleButtonText,
                      selected === shout.num && styles.selectedCircleButtonText,
                    ]}>
                    {shout.num}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.tvtorText}>TVTOR</Text>
              </View>
            ))}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Give a shout-out to those who inspire
            </Text>
            <Text style={styles.descriptionText}>
              with amazing posts! Celebrate their
            </Text>
            <Text style={styles.descriptionText}>
              impact and let them know they're
            </Text>
            <Text style={styles.descriptionText}>making a difference.</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.buttonText}>May be Later</Text>
            </TouchableOpacity>
            <TouchableWithoutFeedback
              disabled={isShout}
              onPress={() => giveShoutOut(feed?.id, type)}>
              <View style={styles.payButton}>
                {isShout ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Pay Now</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalContent: {
    width: '90%',
    maxWidth: 345,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e93c00',
    borderRadius: 20,
    height: 500,
    flexDirection: 'column',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logoContainer: {
    minHeight: 77,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Jakarta',
    fontWeight: '500',
  },
  boldText: {
    fontWeight: 'bold',
  },
  subtitleText: {
    fontFamily: 'Jakarta',
    fontWeight: '500',
    fontSize: 14,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  typeLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Jakarta',
    fontWeight: '500',
    fontSize: 16,
  },
  shoutOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFD2A6',
    paddingVertical: 8,
  },
  shoutOptionItem: {
    flex: 1,
    alignItems: 'center',
  },
  circleButton: {
    width: 54,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderRadius: 45,
  },
  selectedCircleButton: {
    backgroundColor: '#E86900',
  },
  circleButtonText: {
    color: 'white',
    fontSize: 24,
  },
  selectedCircleButtonText: {
    color: 'black',
  },
  tvtorText: {
    fontSize: 18,
    color: 'black',
  },
  descriptionContainer: {
    alignItems: 'center',
  },
  descriptionText: {
    fontFamily: 'Jakarta',
    fontWeight: '500',
    fontSize: 14,
    color: '#545353',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    gap: 12,
  },
  laterButton: {
    backgroundColor: '#8E8D8D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payButton: {
    backgroundColor: '#E93C00',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 106,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontSize: 16,
  },
});

export default ShoutOut;
