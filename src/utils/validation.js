const validator = require("validator");

const validateSingupData = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (firstName.length < 4 || firstName.length > 50) {
    throw new Error("Firstname should be 4-50 character");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password!");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFileds = [
    "firstName",
    "lastName",
    "age",
    "about",
    "photoUrl",
    "gender",
    "skills",
    "phone",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFileds.includes(field)
  );

  return isEditAllowed;
};
module.exports = {
  validateSingupData,
  validateEditProfileData,
};


// NEW VALIDATION VALIDATIONS

// const validator = require('validator');

// const validateSignupData = (data) => {
//   const { firstName, lastName, email, password, age } = data;
  
//   if (!firstName || firstName.length < 2 || firstName.length > 50) {
//     throw new Error('First name must be 2-50 characters');
//   }
  
//   if (!validator.isEmail(email)) {
//     throw new Error('Invalid email address');
//   }
  
//   if (!validator.isStrongPassword(password)) {
//     throw new Error('Password must be strong (min 8 chars, upper, lower, number, symbol)');
//   }
  
//   if (age < 18 || age > 100) {
//     throw new Error('Age must be 18-100');
//   }
  
//   return true;
// };

// const validateProfileEdit = (data) => {
//   const allowedFields = ['firstName', 'lastName', 'age', 'about', 'skills', 'photoUrl', 'gender'];
  
//   const isValidUpdate = Object.keys(data).every(key => 
//     allowedFields.includes(key)
//   );
  
//   if (!isValidUpdate) {
//     throw new Error('Invalid fields in update');
//   }
  
//   return true;
// };

// module.exports = {
//   validateSignupData,
//   validateProfileEdit
// };
