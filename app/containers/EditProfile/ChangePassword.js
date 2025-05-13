import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {renderError} from '../../utils/validation';
import EyeIcon from 'react-native-vector-icons/FontAwesome5';

const initialState = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const ChangePassword = () => {
  const {updatePassword} = useAuth();
  const [loading, setIsloading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState({});
  const [form, setForm] = useState(initialState);

  const handleUpdatePassword = async e => {
    e.preventDefault();
    setIsloading(true);
    const error = await updatePassword(form);
    if (error) {
      setError(error);
    } else {
      setError({});
      setForm(initialState);
    }
    setIsloading(false);
  };

  const handleChange = e => {
    const {name, value} = e.target;
    setForm(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setError({...error, [name]: ''});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Security</Text>
      <View style={styles.formContainer}>
        {/* Old Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showOld}
              name="oldPassword"
              value={form.oldPassword}
              onChangeText={value =>
                handleChange({target: {name: 'oldPassword', value}})
              }
              autoComplete="off"
              placeholder="Current Password"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowOld(!showOld)}
              style={styles.eyeIconContainer}>
              <EyeIcon
                name={showOld ? 'eye' : 'eye-slash'}
                size={18}
                color="#e93c00"
              />
            </TouchableOpacity>
          </View>
          {error.oldPassword && renderError(error.oldPassword)}
        </View>

        {/* New Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNew}
              name="newPassword"
              value={form.newPassword}
              onChangeText={value =>
                handleChange({target: {name: 'newPassword', value}})
              }
              autoComplete="off"
              placeholder="New Password"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowNew(!showNew)}
              style={styles.eyeIconContainer}>
              <EyeIcon
                name={showNew ? 'eye' : 'eye-slash'}
                size={18}
                color="#e93c00"
              />{' '}
            </TouchableOpacity>
          </View>
          {error.newPassword && renderError(error.newPassword)}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirm}
              name="confirmPassword"
              value={form.confirmPassword}
              onChangeText={value =>
                handleChange({target: {name: 'confirmPassword', value}})
              }
              autoComplete="off"
              placeholder="Confirm Password"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeIconContainer}>
              <EyeIcon
                name={showConfirm ? 'eye' : 'eye-slash'}
                size={18}
                color="#e93c00"
              />
            </TouchableOpacity>
          </View>
          {error.confirmPassword && renderError(error.confirmPassword)}
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableWithoutFeedback
            disabled={loading}
            onPress={handleUpdatePassword}>
            <View style={styles.submitButton}>
              <Text style={styles.submitButtonText}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  'Update'
                )}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    marginVertical: 28,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FCE6DE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 12,
    color: '#000',
    height: 38,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  submitButton: {
    backgroundColor: '#e93c00',
    borderRadius: 8,
    paddingHorizontal: 24,
    height: 38,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ChangePassword;
