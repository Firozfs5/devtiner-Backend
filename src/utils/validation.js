let validator = require("validator");
const bcrypt = require("bcrypt");

const validateSignUpData = (data) => {
  let { firstName, lastName, emailId, password } = data;
  console.log(firstName);
  if (!firstName || !lastName) {
    throw new Error("Name is required");
  } else if (!/^[a-zA-Z\s]{2,}$/.test(firstName)) {
    throw new Error("Name is required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Its not a valid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("its a weak Password");
  }
};

const validateEditProfileData = (req) => {
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "gender",
    "skills",
    "about",
    "photoUrl",
    "age",
    "profileVisibility",
  ];

  return Object.keys(req.body).every((field) =>
    ALLOWED_UPDATES.includes(field),
  );
};

const validateOldPassword = async (oldpasswordEnteredByUser, oldPassword) => {
  if (!(await bcrypt.compare(oldpasswordEnteredByUser, oldPassword))) {
    throw new Error("Previous Password is wrong ");
  }
  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
  validateOldPassword,
};
