import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SocialShare = ({visible, handleClose, code, title}) => {
  const onShare = async platform => {
    try {
      const shareMessage = `${title} - ${code}`;

      if (platform) {
        if (Platform.OS === 'ios') {
          switch (platform) {
            case 'twitter':
              const twitterUrl = `twitter://post?message=${encodeURIComponent(
                shareMessage,
              )}`;

              break;
            case 'whatsapp':
              break;
            case 'telegram':
              break;
          }
        } else {
        }
      } else {
        await Share.share({
          message: shareMessage,
          title: title,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const SocialButton = ({platform, color}) => (
    <TouchableOpacity
      style={[styles.socialButton, {backgroundColor: color}]}
      onPress={() => onShare(platform)}>
      {platform === 'twitter' && (
        <Ionicons name="logo-twitter" size={20} color="white" />
      )}
      {platform === 'whatsapp' && (
        <Ionicons name="logo-whatsapp" size={20} color="white" />
      )}
      {platform === 'telegram' && (
        <Ionicons name="paper-plane" size={20} color="white" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#374957" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Share</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.socialButtonsContainer}>
            <SocialButton platform="twitter" color="#1DA1F2" />
            <SocialButton platform="whatsapp" color="#25D366" />
            <SocialButton platform="telegram" color="#0088cc" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxWidth: 400,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialShare;
