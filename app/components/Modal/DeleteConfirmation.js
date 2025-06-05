import React, {useState} from 'react';
import {deleteApiReq} from '../../utils/apiHandlers';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Logo from '../../../public/images/shoutLogo.svg';

const DeleteConfirmation = ({
  open,
  onClose,
  feedId,
  setFeeds,
  setTrailblazer,
}) => {
  const [isDelete, setIsDelete] = useState(false);

  const onDelete = async feedId => {
    setIsDelete(true);
    const res = await deleteApiReq(`/check-ins/${feedId}`);
    if (res?.status) {
      setFeeds(prevFeeds => prevFeeds.filter(feed => feed?.id !== feedId));
      onClose();
      setTrailblazer(prev => ({
        ...prev,
        checkIns: prev?.checkIns - 1,
      }));
    } else {
      console.log('feed deleted failed', res?.error);
    }
    setIsDelete(false);
  };

  return (
    <Modal
      visible={open}
      onRequestClose={onClose}
      transparent
      animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.logoContainer}>
            <Logo width={63} height={63} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>⚠️ Final Confirmation</Text>
            <Text style={styles.descriptionText}>
              Deleting this check-in cannot be undone. Continue?
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableWithoutFeedback
              disabled={isDelete}
              onPress={() => onDelete(feedId)}>
              <View style={styles.deleteButton}>
                {isDelete ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Delete</Text>
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
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalContent: {
    width: '90%',
    maxWidth: 345,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#e93c00', // Replace with your primary-1200 color
    borderRadius: 16,
    height: 280,
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
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Jakarta', // Make sure font is properly loaded
  },
  descriptionText: {
    fontWeight: '500',
    fontSize: 14,
    marginTop: 16,
    fontFamily: 'Jakarta', // Make sure font is properly loaded
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#8E8D8D', // Using the first color from gradient
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#e93c00', // Using the first color from gradient
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter', // Make sure font is properly loaded
    fontWeight: 'normal',
    fontSize: 16,
  },
});

export default DeleteConfirmation;
