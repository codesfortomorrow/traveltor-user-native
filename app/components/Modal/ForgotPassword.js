import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Constant from '../../utils/constant';
import Close from 'react-native-vector-icons/AntDesign';
import OtpVerify from './OtpVerify';
import {emailValidation} from '../../utils/validation';
import useAuth from '../../hooks/useAuth';

const ForgotPassword = ({
  visible,
  onRequestClose,
  setForgotPopup,
  setIsLoginOpen,
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState({});
  const [otpTimerData, setOtpTimerData] = useState({});
  const [email, setEmail] = useState('');
  const [otpPopup, setOtpPopup] = useState(false);
  const {isIOSDevice, convertHindiToEnglishNumbers} = Constant();
  const {sendOtp} = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsDisabled(true);
    setError({});

    try {
      const errorResponse = await sendOtp(
        email,
        onRequestClose,
        setOtpPopup,
        setOtpTimerData,
      );
      if (errorResponse) setError(errorResponse);
    } catch (err) {
      setError({email: 'Something went wrong. Please try again later.'});
    }

    setIsDisabled(false);
  };

  const validateField = async name => {
    try {
      await emailValidation.validateAt(name, {email});
      setError({...error, [name]: ''});
    } catch (error) {
      setError({...error, [name]: error.message});
    }
  };

  const handleBackStep1 = () => {
    setForgotPopup(true);
    setOtpPopup(false);
  };

  const renderError = errorText => (
    <Text style={styles.errorText}>{errorText}</Text>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onRequestClose}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <View style={styles.flexColumn}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    onRequestClose();
                    setEmail('');
                  }}>
                  <Close name="close" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Forgot Password</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.modalContent}>
                <>
                  <View style={styles.textBlock}>
                    <Text style={styles.welcomeText}>Welcome to Traveltor</Text>
                    <Text style={styles.subText}>
                      Own your moments. Prove your presence.
                    </Text>
                    <View style={{marginVertical: 8}} />
                  </View>
                  <View>
                    <View style={{marginVertical: 8}}>
                      <View style={styles.flexColumn}>
                        <Text style={styles.label}>Email</Text>
                        {isIOSDevice() ? (
                          <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={text =>
                              setEmail(convertHindiToEnglishNumbers(text))
                            }
                            style={[
                              styles.input,
                              error.email && styles.inputError,
                            ]}
                          />
                        ) : (
                          <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={text =>
                              setEmail(convertHindiToEnglishNumbers(text))
                            }
                            onBlur={() => validateField('email')}
                            style={[
                              styles.input,
                              error.email && styles.inputError,
                            ]}
                          />
                        )}
                      </View>
                      {error.email && renderError(error.email)}
                    </View>

                    <TouchableOpacity
                      onPress={handleSubmit}
                      // disabled={isDisabled || !email || error.email}
                      style={styles.button}>
                      <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                      Back to{' '}
                      <Text
                        onPress={() => {
                          setIsLoginOpen(true);
                          setForgotPopup(false);
                        }}
                        style={styles.linkText}>
                        Login{' '}
                      </Text>
                      page.
                    </Text>
                  </View>
                </>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <OtpVerify
        visible={otpPopup}
        onRequestClose={() => setOtpPopup(false)}
        email={email}
        handleBackStep1={handleBackStep1}
        otpTimerData={otpTimerData}
        setOtpTimerData={setOtpTimerData}
        setEmail={setEmail}
      />
    </>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '95%',
    height: '77%',
    marginTop: 16,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  flexColumn: {
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  closeIcon: {
    position: 'absolute',
    left: 8,
    color: '#374957',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    paddingRight: 20,
  },
  divider: {
    height: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.23)',
    marginHorizontal: 16,
  },
  modalContent: {
    width: '95%',
    height: '100%',
    alignSelf: 'center',
    padding: 20,
  },
  textBlock: {
    marginBottom: 8,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    color: '#000',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 38,
    borderRadius: 8,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e93c00',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
    color: '#000',
  },
  linkText: {
    color: '#e93c00',
    fontWeight: 'bold',
  },
});
