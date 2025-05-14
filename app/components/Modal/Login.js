import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Constant from '../../utils/constant';
import EyeIcon from 'react-native-vector-icons/FontAwesome5';
import Close from 'react-native-vector-icons/AntDesign';
import ForgotPassword from './ForgotPassword';
import {loginSchema} from '../../utils/validation';
import useAuth from '../../hooks/useAuth';
import {correctEmail} from '../../utils/autoCorrection';

const Login = ({
  visible,
  onRequestClose,
  setIsLoginOpen,
  moveToSignup,
  onCloseMenu,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [error, setError] = useState({});
  const [forgotPopup, setForgotPopup] = useState(false);
  const {login} = useAuth();
  const {isIOSDevice, convertHindiToEnglishNumbers} = Constant();
  const [form, setForm] = useState({
    identifire: '',
    password: '',
  });

  const handleChange = (name, value) => {
    setForm(prevData => ({
      ...prevData,
      [name]: convertHindiToEnglishNumbers(value),
    }));
    setError({...error, [name]: ''});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsDisabled(true);
    setError({});
    const error = await login(form);
    if (error) {
      setError(error);
      setIsDisabled(false);
    } else {
      onRequestClose();
      onCloseMenu();
      setForm({identifire: '', password: ''});
      setIsDisabled(false);
    }
  };

  const validateField = async name => {
    try {
      await loginSchema.validateAt(name, form);
      setError({...error, [name]: ''});
    } catch (error) {
      setError({...error, [name]: error.message});
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onRequestClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => {
                  setForm({identifire: '', password: ''});
                  setError({});
                  onRequestClose();
                }}>
                <Close name="close" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Sign in</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.formContainer}>
              <View style={styles.welcomeBlock}>
                <Text style={styles.welcomeTitle}>Welcome to Traveltor</Text>
                <Text style={styles.welcomeSubtitle}>
                  Own your moments. Prove your presence.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                {isIOSDevice() ? (
                  <TextInput
                    style={[
                      styles.input,
                      error.identifire && styles.inputError,
                    ]}
                    placeholder="Email"
                    value={form.identifire}
                    onChangeText={value => handleChange('identifire', value)}
                  />
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      error.identifire && styles.inputError,
                    ]}
                    placeholder="Email"
                    value={form.identifire}
                    onChangeText={value => handleChange('identifire', value)}
                    onBlur={() => {
                      validateField('identifire');
                      setReadOnly(true);
                      setForm(prevData => ({
                        ...prevData,
                        identifire: correctEmail(form.identifire),
                      }));
                    }}
                    onFocus={() => setReadOnly(false)}
                    // editable={!readOnly}
                  />
                )}
                {/* {error.identifire && renderError(error.identifire)} */}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  {isIOSDevice() ? (
                    <TextInput
                      style={[
                        styles.input,
                        error.password && styles.inputError,
                      ]}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={value => handleChange('password', value)}
                    />
                  ) : (
                    <TextInput
                      style={[
                        styles.input,
                        error.password && styles.inputError,
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
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}>
                    <EyeIcon
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={18}
                      color="#e93c00"
                    />
                  </TouchableOpacity>
                </View>
                {/* {error.password && renderError(error.password)} */}
              </View>

              <View style={styles.forgotBlock}>
                <Text style={styles.forgotText}>
                  Forgot your password?{' '}
                  <Text
                    style={styles.forgotLink}
                    onPress={() => {
                      setForgotPopup(true);
                      onRequestClose();
                      setForm({identifire: '', password: ''});
                    }}>
                    Click Here
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                // disabled={isDisabled}
                onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>

              <Text style={styles.signupPrompt}>
                Welcome back! Please{' '}
                <Text style={styles.signupLink} onPress={moveToSignup}>
                  Sign up
                </Text>{' '}
                to continue.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      <ForgotPassword
        visible={forgotPopup}
        onRequestClose={() => setForgotPopup(false)}
        setForgotPopup={setForgotPopup}
        setIsLoginOpen={setIsLoginOpen}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '95%',
    height: '77%',
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    paddingRight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  welcomeBlock: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#000',
  },
  inputGroup: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  input: {
    height: 38,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: 'red',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  forgotBlock: {
    marginVertical: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#000',
  },
  forgotLink: {
    color: '#e93c00',
    fontWeight: 'bold',
  },
  submitButton: {
    height: 36,
    backgroundColor: 'white',
    borderColor: '#e93c00',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 500,
  },
  signupPrompt: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
  signupLink: {
    color: '#e93c00',
    fontWeight: 'bold',
  },
});

export default Login;
