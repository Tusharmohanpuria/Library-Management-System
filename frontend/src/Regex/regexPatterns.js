export const admissionIdRegex = /^[0-9]{8,}$/; // Minimum 8 digits
export const employeeIdRegex = /^[A-Za-z0-9]{8,}$/; // Minimum 8 characters 
// eslint-disable-next-line no-control-regex
export const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/; // Email
export const otpRegex = /^\d{6}$/; // Six-digit OTP validation regex
// eslint-disable-next-line no-useless-escape
export const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}[\]:;<>,.?~\\/-]{6,}$/; // Minimum 6 characters
export const categoryNameRegex = /^[a-zA-Z0-9\s\-_]+$/; // Only alphabets, numbers, spaces, hyphens, and underscores
export const alphaRegex = /^[\p{L}0-9\s'&.,!@#$%^*()\-+=[\]{};:'"<>,.?_]+$/u; // Only alphabets and spaces
export const alphaNumericRegex = /^[A-Za-z0-9]+$/; // Only alphabets and numbers
export const bookNameRegex = /^[A-Za-z0-9\s'&.,!@#$%^*()\-+=[\]{};:'"<>,.?_]+$/; // Only alphabets, numbers, spaces, and special characters
export const TextPattern = /^[a-zA-Z0-9\s.,!?'"()&@#$%^*+=\-[\]{};:<>,.?_]+$/;// Alphanumeric, space, and punctuation characters
export const Datepattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/; // Date in MM/DD/YYYY format
export const number = /^[0-9]+$/; // Only numbers
export const mobileNumberRegex = /^\d{10}$/; // 10-digit mobile number
export const isbn10Regex = /^\d{10}$/; // ISBN-10
export const isbn13Regex = /^\d{13}$/; // ISBN-13
export const publisherRegex = /^[a-zA-Z0-9\s',.&!@#$%^*()\-+=[\]{};:'"<>,.?_]*$/; // Only alphabets and spaces