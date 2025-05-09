import React from 'react';
import * as yup from 'yup';
import {isYupError, parseYupError} from './Yup';
import {emailRegex, passwordRegex} from './regex';
import {View} from 'react-native';

export const validateData = async (schema, data) => {
  return await schema
    .validate(data, {
      abortEarly: false,
    })
    .then(() => [true, null])
    .catch(err => {
      if (isYupError(err)) {
        return [false, parseYupError(err)];
      }
      console.error(err);
      return [false, null];
    });
};

export const renderError = (error = '') => {
  if (error)
    return (
      <View style={{color: 'red', marginTop: 4, fontSize: 12}}>{error}</View>
    );
};

export const loginSchema = yup.object({
  identifire: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .matches(passwordRegex, 'Invalid Password'),
});

export const registerSchema = yup.object({
  referralCode: yup.string(),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\+?[0-9]+$/, 'Mobile number must contain only digits'),
  firstname: yup
    .string()
    .required('First name is required')
    .min(3, 'First name must be at least 3 characters')
    .max(25, 'First name must not exceed 25 characters')
    .matches(
      /^[a-zA-Z\s]+$/,
      'First name must only contain alphabets and spaces',
    )
    .matches(/^\S.*\S$/, 'First name must not start or end with a space')
    .test(
      'no-only-spaces',
      'First name must not contain only spaces',
      value => value && value.trim() !== '',
    ),
  lastname: yup
    .string()
    .required('Last name is required')
    .min(3, 'Last name must be at least 3 characters')
    .max(25, 'Last name must not exceed 25 characters')
    .matches(
      /^[a-zA-Z\s]+$/,
      'Last name must only contain alphabets and spaces',
    )
    .matches(/^\S.*\S$/, 'Last name must not start or end with a space')
    .test(
      'no-only-spaces',
      'Last name must not contain only spaces',
      value => value && value.trim() !== '',
    ),
  email: yup
    .string()
    .required('Email is required')
    .min(5, 'Email must be at least 5 characters')
    .max(150, 'Email must not exceed 150 characters')
    .matches(/^\S+@\S+\.\S+$/, 'Invalid email address format')
    .test(
      'no-only-spaces',
      'Email must not contain only spaces',
      value => value && value.trim() !== '',
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must not exceed 40 characters')
    .matches(/^\S*$/, 'Password must not contain spaces'),
  termsAndConditions: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions'),
});

export const otpValidationSchema = yup.object({
  emailVerificationCode: yup
    .string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const emailValidation = yup.object({
  email: yup
    .string()
    .required('Please enter email address')
    .matches(emailRegex, 'Please enter valid email.'),
});

export const changePasswordSchema = yup.object().shape({
  Password: yup
    .string()
    .required('New password is required')
    .matches(passwordRegex, 'Password must not contain spaces'),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('Password'), null], 'Passwords must match'),
});
