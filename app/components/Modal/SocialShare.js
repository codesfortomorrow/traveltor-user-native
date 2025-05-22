// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   Linking,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // or react-native-vector-icons

// // Option 1: Using react-native-share (Recommended)
// import Share from 'react-native-share';

// const SocialShare = ({open, handleClose, code, title}) => {
//   const handleCloseModal = () => handleClose();

//   // Method 1: Using react-native-share (Most recommended)
//   const shareViaReactNativeShare = async platform => {
//     const shareOptions = {
//       title: title,
//       message: `${title} - ${code}`,
//       url: code,
//     };

//     try {
//       if (platform === 'twitter') {
//         // Twitter specific sharing
//         await Share.open({
//           ...shareOptions,
//           social: Share.Social.TWITTER,
//         });
//       } else if (platform === 'whatsapp') {
//         // WhatsApp specific sharing
//         await Share.open({
//           ...shareOptions,
//           social: Share.Social.WHATSAPP,
//         });
//       } else if (platform === 'telegram') {
//         // Telegram specific sharing
//         await Share.open({
//           ...shareOptions,
//           social: Share.Social.TELEGRAM,
//         });
//       } else {
//         // Generic share (shows all available apps)
//         await Share.open(shareOptions);
//       }
//     } catch (error) {
//       console.log('Error sharing:', error);
//     }
//   };

//   // Method 2: Using deep links (Alternative approach)
//   const shareViaDeepLinks = platform => {
//     const encodedTitle = encodeURIComponent(title);
//     const encodedUrl = encodeURIComponent(code);
//     const encodedMessage = encodeURIComponent(`${title} - ${code}`);

//     let url = '';

//     switch (platform) {
//       case 'twitter':
//         url = `twitter://post?message=${encodedTitle}&url=${encodedUrl}`;
//         // Fallback to web
//         const twitterWebUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
//         Linking.canOpenURL(url)
//           .then(supported => {
//             if (supported) {
//               Linking.openURL(url);
//             } else {
//               Linking.openURL(twitterWebUrl);
//             }
//           })
//           .catch(() => Linking.openURL(twitterWebUrl));
//         break;

//       case 'whatsapp':
//         url = `whatsapp://send?text=${encodedMessage}`;
//         // Fallback to web
//         const whatsappWebUrl = `https://wa.me/?text=${encodedMessage}`;
//         Linking.canOpenURL(url)
//           .then(supported => {
//             if (supported) {
//               Linking.openURL(url);
//             } else {
//               Linking.openURL(whatsappWebUrl);
//             }
//           })
//           .catch(() => Linking.openURL(whatsappWebUrl));
//         break;

//       case 'telegram':
//         url = `tg://msg?text=${encodedMessage}`;
//         // Fallback to web
//         const telegramWebUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
//         Linking.canOpenURL(url)
//           .then(supported => {
//             if (supported) {
//               Linking.openURL(url);
//             } else {
//               Linking.openURL(telegramWebUrl);
//             }
//           })
//           .catch(() => Linking.openURL(telegramWebUrl));
//         break;

//       default:
//         break;
//     }
//   };

//   return (
//     <Modal
//       visible={open}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={handleCloseModal}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={handleCloseModal}>
//               <Ionicons name="close" size={24} color="#374957" />
//             </TouchableOpacity>

//             <Text style={styles.title}>Share</Text>
//           </View>

//           <View style={styles.divider} />

//           <View style={styles.socialButtons}>
//             {/* Using react-native-share method */}
//             <TouchableOpacity
//               style={styles.socialButton}
//               onPress={() => shareViaReactNativeShare('twitter')}>
//               <View
//                 style={[styles.iconContainer, {backgroundColor: '#1DA1F2'}]}>
//                 <Ionicons name="logo-twitter" size={20} color="white" />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.socialButton}
//               onPress={() => shareViaReactNativeShare('whatsapp')}>
//               <View
//                 style={[styles.iconContainer, {backgroundColor: '#25D366'}]}>
//                 <Ionicons name="logo-whatsapp" size={20} color="white" />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.socialButton}
//               onPress={() => shareViaReactNativeShare('telegram')}>
//               <View
//                 style={[styles.iconContainer, {backgroundColor: '#0088cc'}]}>
//                 <Ionicons name="paper-plane" size={20} color="white" />
//               </View>
//             </TouchableOpacity>

//             {/* Generic share button */}
//             <TouchableOpacity
//               style={styles.socialButton}
//               onPress={() => shareViaReactNativeShare('generic')}>
//               <View style={[styles.iconContainer, {backgroundColor: '#666'}]}>
//                 <Ionicons name="share-social" size={20} color="white" />
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     width: '90%',
//     maxWidth: 400,
//     borderRadius: 12,
//     padding: 0,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     position: 'relative',
//   },
//   closeButton: {
//     position: 'absolute',
//     left: 20,
//     zIndex: 1,
//   },
//   title: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#e0e0e0',
//   },
//   socialButtons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//     gap: 20,
//   },
//   socialButton: {
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default SocialShare;
