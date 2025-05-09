import React, {useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {OtpInput} from 'react-native-otp-entry';
import Constant from '../../utils/constant';
import EyeIcon from 'react-native-vector-icons/FontAwesome5';
import Back from 'react-native-vector-icons/Ionicons';
import {
  changePasswordSchema,
  otpValidationSchema,
} from '../../utils/validation';
import {postReq} from '../../utils/apiHandlers';
import {isYupError, parseYupError} from '../../utils/Yup';
import Toast from 'react-native-toast-message';

const OtpVerify = ({
  visible,
  email,
  handleBackStep1,
  setOtpTimerData,
  otpTimerData,
  onRequestClose,
  setEmail,
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [otpValidate, setOtpValidate] = useState({});
  const [formError, setFormError] = useState({});
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const {isIOSDevice, convertHindiToEnglishNumbers} = Constant();

  useEffect(() => {
    if (otp) {
      const sanitizedOtp = otp.map(convertHindiToEnglishNumbers).join('');
      setOtpValidate({emailVerificationCode: sanitizedOtp});
    }
  }, [otp]);

  useEffect(() => {
    if (otpTimerData) {
      const timerInterval = setInterval(() => {
        calculateRemainingTime();
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [otpTimerData]);

  const calculateRemainingTime = () => {
    if (otpTimerData) {
      const currentTime = Date.now();
      const sentTime = new Date(otpTimerData.sentAt).getTime();
      let remainingTime = otpTimerData.timeout - (currentTime - sentTime);
      remainingTime = Math.max(0, remainingTime);
      setTimeLeft(remainingTime);
      setCanResend(remainingTime === 0);
    }
  };

  const formatTime = time => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  const handleResendOtp = async e => {
    e.preventDefault();
    try {
      const res = await postReq('/auth/forgot-password', {email});
      const {status, data, error} = res;

      if (status) {
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message: 'OTP has been sent to your email. 📩',
        //   }),
        // );
        setOtpTimerData(data?.email);
      } else {
        throw new Error(
          error?.message || 'Failed to send OTP. Please try again.',
        );
      }
    } catch (error) {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: error.message || 'An unexpected error occurred.',
      //   }),
      // );
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const code = otp.join('');

    if (!password) {
      setFormError(prev => ({...prev, password: 'Password is required.'}));
      return;
    }
    if (password.length < 6) {
      setFormError(prev => ({
        ...prev,
        password: 'Password must be at least 6 characters long.',
      }));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match.',
      }));
      return;
    }

    try {
      await otpValidationSchema.validate(
        otpValidate,
        {emailVerificationCode: code},
        {abortEarly: false},
      );

      const res = await postReq('/auth/reset-password', {
        code,
        email,
        newPassword: password,
      });

      if (res?.status) {
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message:
        //       'Your password has been successfully reset! 🔐 You can now log in with your new credentials. Stay secure!.',
        //     defaultMsg: false,
        //   }),
        // );
        onRequestClose();
        // navigate('/');
        setEmail('');
        setOtp(new Array(6).fill(''));
        setPassword('');
        setConfirmPassword('');
        Toast.show({type: 'success', text1: 'Password reset successfully'});
        // openBGScroll();
      } else {
        throw new Error(res?.error?.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);

      if (isYupError(error)) {
        setFormError(parseYupError(error));
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message:
        //       error.message ||
        //       'An unexpected error occurred. Please try again.',
        //   }),
        // );
      }
    }
  };
  useEffect(() => {
    if (confirmPassword) {
      validateField('confirmPassword', confirmPassword);
    }
  }, [password]);

  const validateField = async (name, value) => {
    try {
      await changePasswordSchema.validateAt(name, {
        Password: password,
        confirmPassword: confirmPassword,
        [name]: value,
      });
      setFormError(prev => ({...prev, [name]: ''}));
    } catch (error) {
      setFormError(prev => ({...prev, [name]: error.message}));
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onRequestClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackStep1}>
                <Back name="chevron-back" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Confirm your email</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.emailText}>
              <Text style={{color: 'black'}}>
                Enter the code we’ve sent via email to
              </Text>
              {'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.otpWrapper}>
              <OtpInput
                value={otp.join('')}
                onTextChange={val => {
                  const sanitizedVal = convertHindiToEnglishNumbers(val);
                  const otpArray = sanitizedVal.split('').slice(0, 6);
                  setOtp(otpArray);
                  setFormError({emailVerificationCode: ''});
                }}
                numberOfInputs={6}
                inputStyle={styles.otpInput}
                containerStyle={styles.otpContainer}
                keyboardType="numeric"
                focusStyles={{borderColor: '#007AFF'}}
                isSecure={false}
                autoFocus
              />
            </View>

            <View style={styles.resendWrapper}>
              {canResend ? (
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendText}>Resend code?</Text>
                </TouchableOpacity>
              ) : (
                <Text>
                  <Text style={styles.timerLabel}>Get a new code in</Text>{' '}
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </Text>
              )}
            </View>

            {formError.emailVerificationCode && (
              <View style={styles.errorTextWrapper}>
                {/* {reactIcons.error}{' '} */}
                {renderError(formError.emailVerificationCode)}
              </View>
            )}

            <View style={styles.formWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  placeholder="Enter new password"
                  onChangeText={val => {
                    const converted = convertHindiToEnglishNumbers(val);
                    setPassword(converted);
                    validateField('Password', converted);
                  }}
                  onBlur={() => validateField('password')}
                  style={[
                    styles.textInput,
                    formError.Password && styles.errorInput,
                  ]}
                  editable={!isIOSDevice() || !readOnly}
                  onFocus={() => setReadOnly(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <EyeIcon
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={18}
                    color="#e93c00"
                  />
                </TouchableOpacity>
              </View>
              {formError.Password && (
                <Text style={styles.errorText}>{formError.Password}</Text>
              )}

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  placeholder="Confirm new password"
                  onChangeText={val => {
                    const converted = convertHindiToEnglishNumbers(val);
                    setConfirmPassword(converted);
                    validateField('confirmPassword', converted);
                  }}
                  onBlur={() => {
                    if (confirmPassword)
                      validateField('confirmPassword', confirmPassword);
                  }}
                  style={[
                    styles.textInput,
                    formError.confirmPassword && styles.errorInput,
                  ]}
                  editable={!isIOSDevice() || !readOnly}
                  onFocus={() => setReadOnly(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <EyeIcon
                    name={showConfirmPassword ? 'eye' : 'eye-slash'}
                    size={18}
                    color="#e93c00"
                  />
                </TouchableOpacity>
              </View>
              {formError.confirmPassword && (
                <Text style={styles.errorText}>
                  {formError.confirmPassword}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSubmit}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    zIndex: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.23)',
    marginHorizontal: 16,
  },
  emailText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
  },
  emailHighlight: {
    color: '#007AFF',
  },
  otpWrapper: {
    marginVertical: 16,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000BF',
    borderColor: '#ccc',
  },
  otpContainer: {
    justifyContent: 'center',
    gap: 10,
    marginVertical: 24,
  },
  resendWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  timerLabel: {
    fontSize: 14,
  },
  timerText: {
    color: '#FF0000',
  },
  errorTextWrapper: {
    color: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  textInput: {
    height: 38,
    borderRadius: 8,
    marginTop: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
  },
  errorInput: {
    borderColor: 'red',
  },
  confirmButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e93c00',
    marginVertical: 20,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OtpVerify;
