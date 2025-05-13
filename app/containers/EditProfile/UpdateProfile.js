import React, {useEffect, useRef, useState} from 'react';
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
import {Picker} from '@react-native-picker/picker';
import {useSelector} from 'react-redux';
import {renderError} from '../../utils/validation';
import UploadProfile from './UploadProfile';
import moment from 'moment';
import useAuth from '../../hooks/useAuth';
import Constant from '../../utils/constant';
import Toast from 'react-native-toast-message';

const initialDate = {
  day: '',
  month: '',
  year: '',
};

const initialState = {
  firstname: '',
  lastname: '',
  username: '',
  email: '',
  dialCode: '',
  dateOfBirth: '',
  country: '',
  mobile: '',
  termsAndConditions: false,
};

const UpdateProfile = () => {
  const user = useSelector(state => state.user);
  const textareaRef = useRef(null);
  const {updateUser} = useAuth();
  const [error, setError] = useState({});
  const [date, setDate] = useState(initialDate);
  const [form, setForm] = useState(initialState);
  const [loading, setIsloading] = useState(false);
  const {countryList, generateDays, generateMonths, generateYears} = Constant();

  const handleChange = (name, value) => {
    setForm(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setError({...error, [name]: ''});
  };

  const handleDateChange = (field, value) => {
    setDate(prev => {
      const updatedForm = {...prev, [field]: value};
      if (updatedForm.day && updatedForm.month && updatedForm.year) {
        const date = moment(
          `${updatedForm.year}-${updatedForm.month}-${updatedForm.day}`,
          'YYYY-MM-DD',
        );
        setForm(prevData => ({
          ...prevData,
          dateOfBirth: moment(date).format('YYYY-MM-DD'),
        }));
      }
      return updatedForm;
    });
  };

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      console.log(user);
      const dateOfBirth = user?.dateOfBirth
        ? moment(user.dateOfBirth).toISOString() // Ensure ISO format if needed
        : '';

      const [year, month, day] = dateOfBirth
        ? moment(dateOfBirth).format('YYYY-MM-DD').split('-')
        : [null, null, null];

      setDate(prevDate => ({
        ...prevDate,
        day: day || '',
        month: month ? generateMonths()[parseInt(month, 10) - 1] : '', // Populate month dropdown using name
        year: year || '',
      }));
      setForm(prevData => ({
        ...prevData,
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        username: user?.username || '',
        email: user?.email || '',
        dialCode: user?.dialCode || '',
        dateOfBirth: dateOfBirth || '', // Store ISO string
        country: user?.country || '',
        mobile: user?.mobile?.replace(user?.dialCode, '') || '',
        bio: user?.bio || null,
      }));
    }
  }, [user]);

  const handleUpdate = async () => {
    setIsloading(true);
    const payload = {
      ...form,
      mobile: form?.dialCode + form?.mobile,
    };
    if (!payload.dateOfBirth) {
      delete payload.dateOfBirth;
    }
    if (form?.dialCode && !form?.mobile) {
      setError({mobile: 'Mobile number is required'});
    }
    const {response, error} = form?.mobile && (await updateUser(payload));
    if (response?.status) {
      Toast.show({type: 'success', text1: 'Profile Updated Successfully'});
      setError({});
    } else {
      console.log(error, 'error');
      setError(error);
    }
    setIsloading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Basic</Text>
      <UploadProfile />
      <View>
        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={form.firstname}
              onChangeText={value => handleChange('firstname', value)}
              placeholder="First Name"
              placeholderTextColor="#888"
            />
            {error?.firstname && renderError(error.firstname)}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={form.lastname}
              onChangeText={value => handleChange('lastname', value)}
              placeholder="Last Name"
              placeholderTextColor="#888"
            />
            {error?.lastname && renderError(error.lastname)}
          </View>
        </View>

        <View style={styles.formFullWidth}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={value => handleChange('username', value)}
            placeholder="Username"
            placeholderTextColor="#888"
          />
          {error?.username && renderError(error.username)}
        </View>

        <View style={styles.formFullWidth}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={value => handleChange('email', value)}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
          {error?.email && renderError(error.email)}
        </View>

        <View style={styles.formFullWidth}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.dialCodeContainer}>
              <Picker
                selectedValue={form.dialCode}
                style={styles.dialCodePicker}
                onValueChange={itemValue => {
                  const selectedOption = JSON.parse(itemValue);
                  setForm(prev => ({
                    ...prev,
                    dialCode: selectedOption.dial_code,
                    country: selectedOption.name,
                  }));
                }}>
                {countryList.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={`${item.dial_code}`}
                    value={JSON.stringify({
                      dial_code: item.dial_code,
                      name: item.name,
                    })}
                  />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={form.mobile}
              onChangeText={value => handleChange('mobile', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
          </View>
          {error?.mobile && renderError(error.mobile)}
        </View>

        <View style={styles.formFullWidth}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.dateRow}>
            <View style={styles.datePickerContainer}>
              {console.log(date)}
              <Picker
                selectedValue={Number(date.day)}
                style={styles.datePicker}
                onValueChange={itemValue => handleDateChange('day', itemValue)}>
                {generateDays().map(d => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </View>

            <View style={styles.datePickerContainer}>
              <Picker
                selectedValue={Number(date.month)}
                style={styles.datePicker}
                onValueChange={itemValue =>
                  handleDateChange('month', itemValue)
                }>
                {generateMonths().map(m => (
                  <Picker.Item key={m} label={m} value={m} />
                ))}
              </Picker>
            </View>

            <View style={styles.datePickerContainer}>
              <Picker
                selectedValue={Number(date.year)}
                style={styles.datePicker}
                onValueChange={itemValue =>
                  handleDateChange('year', itemValue)
                }>
                {generateYears().map(y => (
                  <Picker.Item key={y} label={y} value={y} />
                ))}
              </Picker>
            </View>
          </View>
          {error?.dateOfBirth && renderError(error.dateOfBirth)}
        </View>

        <View style={styles.formFullWidth}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            ref={textareaRef}
            style={styles.textArea}
            value={form.bio || ''}
            onChangeText={value => handleChange('bio', value)}
            placeholder="Bio"
            multiline={true}
            numberOfLines={4}
            placeholderTextColor="#888"
          />
          {error?.bio && renderError(error.bio)}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableWithoutFeedback disabled={loading} onPress={handleUpdate}>
            <View style={styles.updateButton}>
              <Text style={styles.buttonText}>
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
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    paddingTop: 10,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  formGroup: {
    flex: 1,
  },
  formFullWidth: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FCE6DE',
    borderRadius: 8,
    padding: 10,
    height: 38,
    fontSize: 12,
    color: 'black',
  },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#FCE6DE',
    borderRadius: 8,
    height: 38,
  },
  dialCodeContainer: {
    width: 110,
    borderRightWidth: 1,
    borderRightColor: 'white',
    justifyContent: 'center',
  },
  dialCodePicker: {
    width: '100%',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    color: 'black',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePickerContainer: {
    flex: 1,
    backgroundColor: '#FCE6DE',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
  },
  datePicker: {
    // height: 38,
  },
  textArea: {
    backgroundColor: '#FCE6DE',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 12,
    color: 'black',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#e93c00',
    borderRadius: 8,
    paddingHorizontal: 24,
    height: 38,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default UpdateProfile;
