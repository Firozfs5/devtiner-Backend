let validator = require("validator");

const validateSignUpData = (req) => {
  let { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Its not a valid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("its a weak Password");
  }
};

module.exports = { validateSignUpData };
