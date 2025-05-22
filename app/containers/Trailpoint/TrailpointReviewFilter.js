import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import ArrowRight from 'react-native-vector-icons/Feather';

const TrailpointReviewFilter = ({open, handleClose}) => {
  const [sortOrder, setSortOrder] = useState(0);
  const [userType, setUserType] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(moment().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState(''); // 'start' or 'end'
  const [tempDate, setTempDate] = useState(new Date());

  const handleCloseModal = () => {
    setSortOrder(0);
    setUserType('');
    setDuration('');
    setStartDate('');
    setEndDate('');
    setShowDatePicker(false);
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

  const showStartPicker = () => {
    setDatePickerType('start');
    setTempDate(startDate ? new Date(startDate) : new Date());
    setShowDatePicker(true);
  };

  const showEndPicker = () => {
    setDatePickerType('end');
    setTempDate(endDate ? new Date(endDate) : new Date());
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (datePickerType === 'start') {
      setStartDate(moment(tempDate).toISOString());
    } else {
      setEndDate(moment(tempDate).toISOString());
    }
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
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

  const DateInputField = ({
    label,
    value,
    onPress,
    placeholder = 'Select date',
  }) => {
    return (
      <View style={styles.datePickerHalf}>
        <Text style={styles.datePickerLabel}>{label}</Text>
        <TouchableOpacity style={styles.dateInputButton} onPress={onPress}>
          <Text
            style={[styles.dateInputText, !value && styles.placeholderText]}>
            {value ? moment(value).format('YYYY-MM-DD') : placeholder}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const CustomDatePicker = () => {
    const currentDate = moment(tempDate);
    const year = currentDate.year();
    const month = currentDate.month();
    const date = currentDate.date();
    const today = moment();

    // Generate years from 10 years ago to current year only
    const currentYear = today.year();
    const years = Array.from({length: 11}, (_, i) => currentYear - 10 + i);

    const months = moment.months();
    const daysInMonth = moment(tempDate).daysInMonth();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const updateDate = (newYear, newMonth, newDay) => {
      const newDate = moment().year(newYear).month(newMonth).date(newDay);

      // Don't allow dates in the future
      if (newDate.isAfter(today, 'day')) {
        return;
      }

      setTempDate(newDate.toDate());
    };

    // Filter out future months for current year
    const getAvailableMonths = () => {
      if (year === currentYear) {
        return months.slice(0, today.month() + 1);
      }
      return months;
    };

    // Filter out future days for current month and year
    const getAvailableDays = () => {
      if (year === currentYear && month === today.month()) {
        const maxDay = Math.min(daysInMonth, today.date());
        return Array.from({length: maxDay}, (_, i) => i + 1);
      }
      return days;
    };

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={handleDateCancel}>
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>
                Select {datePickerType === 'start' ? 'Start' : 'End'} Date
              </Text>
            </View>

            <View style={styles.datePickerContent}>
              <View style={styles.pickerRow}>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <ScrollView
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}>
                    {years.map(y => {
                      const isDisabled = y > currentYear;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[
                            styles.pickerItem,
                            y === year && styles.pickerItemSelected,
                            isDisabled && styles.pickerItemDisabled,
                          ]}
                          onPress={() => {
                            if (!isDisabled) {
                              // When changing year, adjust month and day if necessary
                              let newMonth = month;
                              let newDay = date;

                              // If selecting current year, don't allow future months
                              if (y === currentYear && month > today.month()) {
                                newMonth = today.month();
                              }

                              // If selecting current year and month, don't allow future days
                              if (
                                y === currentYear &&
                                newMonth === today.month() &&
                                date > today.date()
                              ) {
                                newDay = today.date();
                              }

                              updateDate(y, newMonth, newDay);
                            }
                          }}
                          disabled={isDisabled}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              y === year && styles.pickerItemTextSelected,
                              isDisabled && styles.pickerItemTextDisabled,
                            ]}>
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <ScrollView
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}>
                    {getAvailableMonths().map((m, index) => {
                      const isDisabled =
                        year === currentYear && index > today.month();
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.pickerItem,
                            index === month && styles.pickerItemSelected,
                            isDisabled && styles.pickerItemDisabled,
                          ]}
                          onPress={() => {
                            if (!isDisabled) {
                              const newDay = Math.min(
                                date,
                                moment().year(year).month(index).daysInMonth(),
                              );
                              updateDate(year, index, newDay);
                            }
                          }}
                          disabled={isDisabled}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              index === month && styles.pickerItemTextSelected,
                              isDisabled && styles.pickerItemTextDisabled,
                            ]}>
                            {m.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <ScrollView
                    style={styles.picker}
                    showsVerticalScrollIndicator={false}>
                    {getAvailableDays().map(d => {
                      const isDisabled =
                        year === currentYear &&
                        month === today.month() &&
                        d > today.date();
                      return (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.pickerItem,
                            d === date && styles.pickerItemSelected,
                            isDisabled && styles.pickerItemDisabled,
                          ]}
                          onPress={() => {
                            if (!isDisabled) {
                              updateDate(year, month, d);
                            }
                          }}
                          disabled={isDisabled}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              d === date && styles.pickerItemTextSelected,
                              isDisabled && styles.pickerItemTextDisabled,
                            ]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={styles.datePickerCancelButton}
                onPress={handleDateCancel}>
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerConfirmButton}
                onPress={handleDateConfirm}>
                <Text style={styles.datePickerButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
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
                        setDuration(
                          moment().subtract(12, 'months').toISOString(),
                        )
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
                        setDuration(
                          moment().subtract(6, 'months').toISOString(),
                        )
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
                        setDuration(
                          moment().subtract(3, 'months').toISOString(),
                        )
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
                    <DateInputField
                      label="Start Date"
                      value={startDate}
                      onPress={showStartPicker}
                      placeholder="Select start date"
                    />
                    <DateInputField
                      label="End Date"
                      value={endDate}
                      onPress={showEndPicker}
                      placeholder="Select end date"
                    />
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

      <CustomDatePicker />
    </>
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
    marginBottom: 60,
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
  dateInputButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dateInputText: {
    fontSize: 14,
    color: '#374151',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  calendarIcon: {
    fontSize: 16,
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
  // Custom Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 350,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datePickerHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  datePickerContent: {
    paddingHorizontal: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  picker: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#e93c00',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  pickerItemDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  pickerItemTextDisabled: {
    color: '#9CA3AF',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  datePickerCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: '#6B7280',
  },
  datePickerConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: '#e93c00',
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TrailpointReviewFilter;
