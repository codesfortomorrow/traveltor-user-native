import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import moment from 'moment';
import ArrowRight from 'react-native-vector-icons/Feather';

const TrailpointReviewFilter = ({open, handleClose}) => {
  const [sortOrder, setSortOrder] = useState(0);
  const [userType, setUserType] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(moment().toISOString());

  const handleCloseModal = () => {
    setSortOrder(0);
    setUserType('');
    setDuration('');
    setStartDate('');
    setEndDate('');
    const payload = {
      sortOrder: sortOrder,
      userType: userType,
      startDate: '',
      endDate: '',
    };
    handleClose(payload);
  };

  const handleSubmit = () => {
    const payload = {
      sortOrder: sortOrder,
      userType: userType,
      startDate: duration === 'custom' ? startDate : duration,
      endDate: endDate,
    };
    handleClose(payload);
  };

  const CustomRadioButton = ({label, checked, onPress}) => {
    return (
      <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
        <View style={[styles.radioOuter, checked && styles.radioOuterChecked]}>
          {checked && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={open}
      onRequestClose={handleCloseModal}
      transparent
      animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}>
                <ArrowRight
                  name="arrow-right-circle"
                  size={24}
                  color="#374957"
                />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Short Review</Text>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Latest to oldest"
                    checked={sortOrder === 0}
                    onPress={() => setSortOrder(0)}
                  />
                </View>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Oldest to latest"
                    checked={sortOrder === 1}
                    onPress={() => setSortOrder(1)}
                  />
                </View>
              </View>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Travelor first"
                    checked={sortOrder === 2}
                    onPress={() => setSortOrder(2)}
                  />
                </View>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Trailblazers first"
                    checked={sortOrder === 3}
                    onPress={() => setSortOrder(3)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filters</Text>
              <Text style={styles.subsectionTitle}>User Type</Text>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="All Review"
                    checked={userType === ''}
                    onPress={() => setUserType('')}
                  />
                </View>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Trailblazer Only"
                    checked={userType === 'Trailblazer'}
                    onPress={() => setUserType('Trailblazer')}
                  />
                </View>
              </View>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Travelors only"
                    checked={userType === 'User'}
                    onPress={() => setUserType('User')}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.subsectionTitle}>Time Duration</Text>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="All time Reviews"
                    checked={duration === ''}
                    onPress={() => setDuration('')}
                  />
                </View>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="12 Month old"
                    checked={
                      moment(duration).format('YYYY-MM-DD') ===
                      moment().subtract(12, 'months').format('YYYY-MM-DD')
                    }
                    onPress={() =>
                      setDuration(moment().subtract(12, 'months').toISOString())
                    }
                  />
                </View>
              </View>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="6 Month old"
                    checked={
                      moment(duration).format('YYYY-MM-DD') ===
                      moment().subtract(6, 'months').format('YYYY-MM-DD')
                    }
                    onPress={() =>
                      setDuration(moment().subtract(6, 'months').toISOString())
                    }
                  />
                </View>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="3 Month old"
                    checked={
                      moment(duration).format('YYYY-MM-DD') ===
                      moment().subtract(3, 'months').format('YYYY-MM-DD')
                    }
                    onPress={() =>
                      setDuration(moment().subtract(3, 'months').toISOString())
                    }
                  />
                </View>
              </View>
              <View style={styles.radioGroupRow}>
                <View style={styles.radioGroupHalf}>
                  <CustomRadioButton
                    label="Custom"
                    checked={duration === 'custom'}
                    onPress={() => setDuration('custom')}
                  />
                </View>
              </View>
              {duration === 'custom' && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHalf}>
                    <Text style={styles.datePickerLabel}>Start Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={moment(startDate).format('YYYY-MM-DD')}
                      onChangeText={text =>
                        setStartDate(moment(text).toISOString())
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={styles.datePickerHalf}>
                    <Text style={styles.datePickerLabel}>End Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={moment(endDate).format('YYYY-MM-DD')}
                      onChangeText={text =>
                        setEndDate(moment(text).toISOString())
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleCloseModal}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleSubmit}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    position: 'relative',
  },
  header: {
    height: 30,
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'black',
  },
  scrollContainer: {
    height: '100%',
    marginBottom: 60, // To account for the footer height
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 2,
  },
  sectionTitle: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  subsectionTitle: {
    color: 'black',
    fontSize: 16,
  },
  radioGroupRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  radioGroupHalf: {
    width: '45%',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterChecked: {
    backgroundColor: 'orange',
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 12,
  },
  radioInner: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'black',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  datePickerHalf: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resetButton: {
    backgroundColor: '#230404',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 2,
  },
  applyButton: {
    backgroundColor: '#e93c00',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default TrailpointReviewFilter;
