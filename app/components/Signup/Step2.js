import React, {useEffect, useState} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Back from 'react-native-vector-icons/Ionicons';
import {isYupError, parseYupError} from '../../utils/Yup';
import {postReq, setAuthToken} from '../../utils/apiHandlers';
import {otpValidationSchema} from '../../utils/validation';
import Constant from '../../utils/constant';
import Toast from 'react-native-toast-message';
import {OtpInput} from 'react-native-otp-entry';

const Step2 = ({
  formData,
  step2open,
  handleCloseStep2,
  handleBackStep1,
  handleContinueStep3,
  setOtpTimerData,
  otpTimerData,
  setStep2open,
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [otpValidate, setOtpValidate] = useState({});
  const [formError, setFormError] = useState({});
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const {convertHindiToEnglishNumbers} = Constant();

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
      const currentTime = new Date().getTime();
      const sentTime = new Date(otpTimerData.sentAt).getTime();
      const elapsedTime = currentTime - sentTime;
      const remainingTime = otpTimerData.timeout - elapsedTime;
      if (remainingTime <= 0) {
        setCanResend(true);
        setTimeLeft(0);
      } else {
        setCanResend(false);
        setTimeLeft(remainingTime);
      }
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
      const payload = {
        email: formData.email,
        type: 'register',
        country: formData.country,
      };
      const res = await postReq('/auth/send-code', payload);
      const {status, data, error} = res;
      if (status) {
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message:
        //       ' submitted your request, We have sent you OTP on entered e-mail.',
        //   }),
        // );
        setOtpTimerData(data?.email);
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message:
        //       error?.message || 'Failed to send OTP. Please try again.',
        //   }),
        // );
      }
    } catch (error) {
      if (isYupError(error)) {
        setFormError(parseYupError(error));
      } else {
        console.error('Unexpected error:', error);
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: 'An unexpected error occurred. Please try again.',
        //   }),
        // );
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await otpValidationSchema.validate(otpValidate, {abortEarly: false});
      const res = await postReq('/auth/register', {
        ...formData,
        mobile: `${formData?.dialCode}${formData?.mobile}`,
        emailVerificationCode: otp.join(''),
      });
      const {status, data, error} = res;
      if (status) {
        await setAuthToken(data?.accessToken);
        // dispatch(init());
        handleContinueStep3();
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message:
        //       "created your profile, Let's go for your first check-in.",
        //   }),
        // );
        setStep2open(false);
        Toast.show({type: 'success', text1: 'Signup successsfully'});
        // navigate('/');
        setTimeout(() => {
          handleContinueStep3();
        }, 2000);
        // openBGScroll();
      } else {
        Toast.show({type: 'error', text1: error?.message});
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: ` ${error.message}`,
        //   }),
        // );
      }
    } catch (error) {
      if (isYupError(error)) {
        setFormError(parseYupError(error));
      } else {
        console.error('Unexpected error:', error);
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: 'An unexpected error occurred. Please try again.',
        //   }),
        // );
      }
    }
  };

  return (
    <Modal
      visible={step2open}
      transparent
      animationType="fade"
      onRequestClose={handleCloseStep2}>
      <View style={styles.container}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackStep1} style={styles.backBtn}>
              <Back name="chevron-back" size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerTextBox}>
              <Text style={styles.headerText}>Confirm your email</Text>
            </View>
          </View>

          <Text style={styles.instructionText}>
            <Text style={styles.boldText}>
              Enter the code we&apos;ve sent via email to
            </Text>
            {'\n'}
            <Text style={styles.primaryText}>{formData?.email}</Text>
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
              <Text style={styles.resendCountdown}>
                <Text style={styles.blackText}>Get a new code in </Text>
                <Text style={styles.redText}>{formatTime(timeLeft)}</Text>
              </Text>
            )}
          </View>

          {formError.emailVerificationCode && (
            <View style={styles.errorBox}>
              {/* {reactIcons.error} */}
              {/* {renderError(formError.emailVerificationCode)} */}
            </View>
          )}

          <View style={styles.buttonBox}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.continueButton}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalBox: {
    width: '90%',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#0000003B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: 8,
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBox: {
    width: '90%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    color: '#000',
  },
  boldText: {
    color: '#000000',
  },
  primaryText: {
    color: '#e93c00',
  },
  otpWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
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
    paddingHorizontal: 20,
  },
  resendText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#e93c00',
    fontWeight: '500',
  },
  resendCountdown: {
    fontSize: 14,
    fontWeight: '500',
  },
  blackText: {
    color: '#000000',
  },
  redText: {
    color: '#FF0000',
  },
  errorBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    color: 'red',
  },
  buttonBox: {
    width: '100%',
    padding: 16,
  },
  continueButton: {
    borderWidth: 1,
    borderColor: '#e93c00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
  },
});

export default Step2;
