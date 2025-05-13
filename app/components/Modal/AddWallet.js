import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Close from 'react-native-vector-icons/AntDesign';
import EyeIcon from 'react-native-vector-icons/FontAwesome5';
import useAuth from '../../hooks/useAuth';
import {addWalletSchema, renderError} from '../../utils/validation';
import Constant from '../../utils/constant';

const AddWallet = ({open, handleClose}) => {
  const handleCloseModal = () => handleClose();
  const {addWallet} = useAuth();
  const {isIOSDevice} = Constant();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [error, setError] = useState({});
  const [form, setForm] = useState({
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (name, value) => {
    setForm(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setError({...error, [name]: ''});
  };

  const handleSubmit = async () => {
    setIsDisabled(true);
    setError({});
    if (form?.password !== form?.confirmPassword) {
      setError({...error, confirmPassword: 'Password Not Matched'});
      setIsDisabled(false);
      return;
    }
    const error = await addWallet(form);
    if (error) {
      setError(error);
      setIsDisabled(false);
    } else {
      setIsDisabled(false);
      handleCloseModal();
    }
  };

  const validateField = async name => {
    try {
      await addWalletSchema.validateAt(name, form);
      setError({...error, [name]: ''});
    } catch (error) {
      setError({...error, [name]: error.message});
    }
  };

  const renderPasswordInput = (
    name,
    value,
    showPass,
    setShowPass,
    confirmPassError,
  ) => {
    const inputProps =
      name === 'confirmPassword'
        ? {value: form[name], onChangeText: text => handleChange(name, text)}
        : {value: form[name], onChangeText: text => handleChange(name, text)};

    return (
      <View style={styles.inputContainer}>
        <View style={styles.passwordInputWrapper}>
          {isIOSDevice() ? (
            <TextInput
              {...inputProps}
              placeholder={
                name === 'password' ? 'Password' : 'Confirm Password'
              }
              secureTextEntry={!showPass}
              style={[
                styles.input,
                confirmPassError ? styles.errorBorder : styles.normalBorder,
              ]}
            />
          ) : (
            <TextInput
              {...inputProps}
              placeholder={
                name === 'password' ? 'Password' : 'Confirm Password'
              }
              secureTextEntry={!showPass}
              style={[
                styles.input,
                confirmPassError ? styles.errorBorder : styles.normalBorder,
              ]}
              onBlur={() => {
                validateField(name);
                setReadOnly(true);
              }}
              onFocus={() => setReadOnly(false)}
              //   editable={!readOnly}
            />
          )}
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            style={styles.eyeIconContainer}>
            <EyeIcon
              name={showPass ? 'eye' : 'eye-slash'}
              size={18}
              color="#e93c00"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeIcon}>
              <Close name="close" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Connect Wallet</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.formContainer}>
            {/* Wallet Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wallet Address</Text>
              {isIOSDevice() ? (
                <TextInput
                  value={form.address}
                  onChangeText={text => handleChange('address', text)}
                  placeholder="Paste Your Wallet Address"
                  style={[
                    styles.input,
                    error.address ? styles.errorBorder : styles.normalBorder,
                  ]}
                  minLength={5}
                  maxLength={150}
                />
              ) : (
                <TextInput
                  value={form.address}
                  onChangeText={text => handleChange('address', text)}
                  placeholder="Paste Your Wallet Address"
                  style={[
                    styles.input,
                    error.address ? styles.errorBorder : styles.normalBorder,
                  ]}
                  onBlur={() => {
                    validateField('address');
                    setReadOnly(true);
                  }}
                  onFocus={() => setReadOnly(false)}
                  editable={!readOnly}
                  minLength={5}
                  maxLength={150}
                />
              )}
            </View>
            {error.address && renderError(error.address)}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              {renderPasswordInput(
                'password',
                form.password,
                showPassword,
                setShowPassword,
                error.password,
              )}
            </View>
            {error.password && renderError(error.password)}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              {renderPasswordInput(
                'confirmPassword',
                form.confirmPassword,
                showConfirmPassword,
                setShowConfirmPassword,
                error.confirmPassword,
              )}
            </View>
            {error.confirmPassword && renderError(error.confirmPassword)}

            <Text style={styles.noteText}>
              Note: Please make sure to securely store your password, as it will
              be needed in the future to recover your lost data from the
              decentralized storage. Also, please read the terms & conditions.
            </Text>

            <TouchableOpacity onPress={handleSubmit} disabled={isDisabled}>
              <View style={styles.submitButton}>
                <Text style={styles.submitButtonText}>
                  {isDisabled ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    'Submit'
                  )}
                </Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '95%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    left: 8,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  input: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  normalBorder: {
    borderColor: '#9CA3AF',
  },
  errorBorder: {
    borderColor: '#DC2626',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{translateY: -10}],
  },
  noteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginVertical: 10,
    lineHeight: 16,
  },
  submitButton: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e93c00',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  submitButtonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: '500',
  },
});

export default AddWallet;
