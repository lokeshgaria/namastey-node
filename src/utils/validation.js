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
