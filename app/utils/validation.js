import React from 'react';
import * as yup from 'yup';
import {isYupError, parseYupError} from './Yup';
import {emailRegex, passwordRegex} from './regex';
import {Text} from 'react-native';

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
      <Text style={{color: 'red', marginTop: 4, fontSize: 12}}>{error}</Text>
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

export const updateUserSchema = yup.object({
  firstname: yup
    .string()
    .required('First name is required')
    .min(3, 'First name must be at least 3 characters')
    .max(25, 'First name must not exceed 25 characters')
    .matches(/^[A-Za-z ]+$/, 'First name must be letters only')
    .matches(
      /^(?! ).*(?<! )$/,
      'First name must not start or end with a space',
    ),
  lastname: yup
    .string()
    .required('Last name is required')
    .min(3, 'Last name must be at least 3 characters')
    .max(25, 'Last name must not exceed 25 characters')
    .matches(/^[A-Za-z ]+$/, 'Last name must be letters only')
    .matches(/^(?! ).*(?<! )$/, 'Last name must not start or end with a space'),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(25, 'Username must not exceed 25 characters')
    .matches(
      /^[A-Za-z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    )
    .matches(/^(?! ).*(?<! )$/, 'Username must not start or end with a space'),
  email: yup.string().matches(emailRegex, 'Invalid email address'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\+?[0-9]+$/, 'Mobile number must contain only digits'),
  dateOfBirth: yup.string(),
});

export const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Old password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .matches(passwordRegex, 'Password must not contain spaces')
    .test(
      'not-same-as-old',
      'New password cannot be the same as old password',
      function (value) {
        const {oldPassword} = this.parent;
        // Check if oldPassword is present and if newPassword matches it
        return oldPassword ? value !== oldPassword : true;
      },
    ),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

export const addWalletSchema = yup.object({
  address: yup
    .string()
    .required('Please Enter Wallet Address')
    .transform(value => value.replace(/\s+/g, ''))
    .matches(
      /^(0x)?[0-9a-fA-F]{40}$/,
      'Wallet address must be a valid hexadecimal string with or without a "0x" prefix.',
    ),

  password: yup
    .string()
    .required('Password is required')
    .matches(
      passwordRegex,
      'Password must be at least 8 characters, including one uppercase letter, one special character, and alphanumeric characters',
    ),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});
