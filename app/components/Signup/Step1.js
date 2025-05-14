import React, {useEffect, useState} from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import Constant from '../../utils/constant';
import {correctEmail} from '../../utils/autoCorrection';
import Close from 'react-native-vector-icons/AntDesign';
import EyeIcon from 'react-native-vector-icons/FontAwesome5';
import {registerSchema} from '../../utils/validation';
import {useRoute} from '@react-navigation/native';
import {postReq} from '../../utils/apiHandlers';
import {isYupError, parseYupError} from '../../utils/Yup';
import Toast from 'react-native-toast-message';

const Step1 = ({
  handleStep1,
  step1open,
  handleCloseStep1,
  handleContinueStep2,
  moveToLogin,
  setOtpTimerData,
}) => {
  const [form, setForm] = useState({
    dialCode: '+91',
    country: 'India',
    mobile: '',
    termsAndConditions: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [formError, setFormError] = useState({});
  const {isIOSDevice, convertHindiToEnglishNumbers, countryList} = Constant();
  // const {refeeralCode} = useRoute().params;

  const handleChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: convertHindiToEnglishNumbers(value),
    }));
    setFormError(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleCheckboxToggle = () => {
    setForm(prev => ({
      ...prev,
      termsAndConditions: !prev.termsAndConditions,
    }));
  };

  // useEffect(() => {
  //   if (refeeralCode) {
  //     setForm(prevData => ({
  //       ...prevData,
  //       referralCode: refeeralCode,
  //     }));
  //   }
  // }, [refeeralCode]);

  const handleSubmit = async e => {
    e.preventDefault();
    handleStep1(form);
    try {
      await registerSchema.validate(form, {abortEarly: false});
      const payload = {
        email: form.email,
        type: 'register',
        country: form.country,
      };
      const res = await postReq('/auth/send-code', payload);
      const {status, data, error} = res;
      if (status) {
        handleStep1(form);
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message:
        //       ' cleared first step, We have sent you OTP on entered e-mail.',
        //   }),
        // );
        setOtpTimerData(data?.email);
        handleContinueStep2();
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message:
        //       error?.message || 'Failed to send OTP. Please try again.',
        //   }),
        // );
        Toast.show({type: 'error', text1: res?.error?.message});
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

  const selectedCountry = countryList.find(
    item => item.dial_code === form.dialCode,
  );

  const trimmer = name => {
    setForm(prevData => ({
      ...prevData,
      [name]: form[name]?.trim(),
    }));
  };

  const validateField = async name => {
    try {
      await registerSchema.validateAt(name, form);
      setFormError({...formError, [name]: ''});
      return true;
    } catch (error) {
      setFormError({...formError, [name]: error.message});
      return false;
    }
  };

  const renderError = errorText => (
    <Text style={styles.errorText}>{errorText}</Text>
  );

  return (
    <>
      <Modal
        visible={step1open}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStep1}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalInner}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => {
                    handleCloseStep1();
                    setFormError({});
                    setForm({
                      dialCode: '+91',
                      country: 'India',
                      mobile: '',
                    });
                  }}>
                  <Close name="close" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Sign up</Text>
              </View>

              <View style={styles.divider} />

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Welcome to Traveltor</Text>
                <Text style={styles.subtitle}>
                  Own your moments. Prove your presence.
                </Text>

                <Text style={styles.label}>First Name</Text>
                <TextInput
                  placeholder="First name"
                  value={form.firstname}
                  onChangeText={value => handleChange('firstname', value)}
                  onBlur={() => trimmer('firstname')}
                  style={[
                    styles.input,
                    formError.firstname && styles.inputError,
                  ]}
                />
                {formError.firstname && renderError(formError.firstname)}

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  placeholder="Last name"
                  value={form.lastname}
                  onChangeText={value => handleChange('lastname', value)}
                  onBlur={() => trimmer('lastname')}
                  style={[
                    styles.input,
                    formError.lastname && styles.inputError,
                  ]}
                />
                {formError.lastname && renderError(formError.lastname)}

                <Text style={styles.label}>Email</Text>
                {isIOSDevice() ? (
                  <TextInput
                    style={[styles.input, formError.email && styles.inputError]}
                    placeholder="Email"
                    value={form.email}
                    onChangeText={value => handleChange('email', value)}
                  />
                ) : (
                  <TextInput
                    placeholder="Email"
                    value={form.email}
                    onChangeText={value => handleChange('email', value)}
                    onBlur={() => {
                      trimmer('email');
                      setReadOnly(true);
                      setForm(prev => ({
                        ...prev,
                        email: correctEmail(form.email),
                      }));
                    }}
                    onFocus={() => setReadOnly(false)}
                    // editable={!readOnly}
                    style={[styles.input, formError.email && styles.inputError]}
                  />
                )}
                {formError.email && renderError(formError.email)}

                <Text style={styles.label}>Mobile</Text>
                <View style={styles.phoneContainer}>
                  <Text style={styles.phoneCode}>{form.dialCode}</Text>
                  <TextInput
                    placeholder="Enter your phone number"
                    value={form.mobile}
                    onChangeText={value => {
                      if (value.length <= 20) {
                        handleChange('mobile', value);
                      }
                    }}
                    keyboardType="numeric"
                    onBlur={() => validateField('mobile')}
                    style={styles.phoneInput}
                  />
                </View>
                {formError.mobile && renderError(formError.mobile)}

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  {isIOSDevice() ? (
                    <TextInput
                      placeholder="Password"
                      value={form.password}
                      onChangeText={value => handleChange('password', value)}
                      secureTextEntry={!showPassword}
                      style={[
                        styles.input,
                        formError.password && styles.inputError,
                      ]}
                    />
                  ) : (
                    <TextInput
                      style={[
                        styles.input,
                        formError.password && styles.inputError,
                      ]}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={value => handleChange('password', value)}
                      onBlur={() => {
                        validateField('password');
                        setReadOnly(true);
                      }}
                      onFocus={() => setReadOnly(false)}
                      // editable={!readOnly}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <EyeIcon
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={18}
                      color="#e93c00"
                    />
                  </TouchableOpacity>
                </View>
                {formError.password && renderError(formError.password)}

                <Text style={styles.label}>Referral Code</Text>
                <TextInput
                  placeholder="Referral Code"
                  value={form.referralCode}
                  onChangeText={value => handleChange('referralCode', value)}
                  onBlur={() => validateField('referralCode')}
                  editable={!form.refeeralCode}
                  style={[
                    styles.input,
                    formError.referralCode && styles.inputError,
                  ]}
                />
                {formError.referralCode && renderError(formError.referralCode)}

                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={handleCheckboxToggle}>
                  <View
                    style={[
                      styles.checkbox,
                      form.termsAndConditions && styles.checkboxChecked,
                    ]}
                  />
                  <Text style={styles.termsText}>
                    By selecting Agree and continue, I agree to Traveltor{' '}
                    <Text style={styles.termsTextLink}>Terms of Service</Text>,
                    Payments{' '}
                    <Text style={styles.termsTextLink}>Terms of Service</Text>,
                    and{' '}
                    <Text style={styles.termsTextLink}>
                      Nondiscrimination Policy
                    </Text>{' '}
                    and acknowledge the{' '}
                    <Text style={styles.termsTextLink}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>
                {formError.termsAndConditions &&
                  renderError(formError.termsAndConditions)}

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleSubmit}>
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>

                <Text
                  style={{textAlign: 'center', fontSize: 17, marginTop: 16}}>
                  Welcome back! Please
                  <Text onPress={moveToLogin} style={styles.signInLink}>
                    {' '}
                    Sign in{' '}
                  </Text>
                  to continue.
                </Text>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Step1;

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '95%',
    height: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  modalInner: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButton: {
    marginLeft: 8,
    position: 'absolute',
    left: 0,
  },
  headerText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  scroll: {
    width: '100%',
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 6,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  phoneCode: {
    marginRight: 8,
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#e93c00',
  },
  termsText: {
    fontSize: 12,
    lineHeight: 16,
    color: 'gray',
  },
  termsTextLink: {
    color: '#e93c00',
    textDecorationLine: 'underline',
    fontSize: 11,
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderColor: '#e93c00',
    borderWidth: 1,
    borderRadius: 8,
  },
  continueText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
  },
  signInLink: {
    color: '#e93c00',
    fontWeight: 'bold',
  },
});
