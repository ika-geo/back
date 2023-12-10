//validations
const Joi = require("@hapi/joi");

const registerValidation = (userData) => {
  const validationSchema = Joi.object({
    name: Joi.string().min(6).required().messages({
      "string.min": "username should contain atleast 6 characters",
      "any.required": "username required",
    }),
    email: Joi.string().min(6).lowercase().required().email().messages({
      "string.min": "email should contain atleast 6 characters",
      "string.lowercase": "email should contain all lowercase alphabets",
      "any.required": "eamil required",
      "string.email": "Email should be valid",
    }),
    password: Joi.string()
      .min(6)
      .required()
      .pattern(
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
      )
      .messages({
        "string.min": "password should contain atleast 6 characters",
        "any.required": "password required",
        "string.pattern.base":
          "password should be atleast 8 characters long with atleast one Upper case, one lower case,one number and one special character",
      }),
  });
  return validationSchema.validate(userData);
};

const loginValidation = (userData) => {
  const validationSchema = Joi.object({
    //The email should be of type string,and valid and min length of 6 characters and it is required field
    email: Joi.string().min(6).required().email(),
    //The password should be of type string of min length 6 characters and it is required field
    password: Joi.string().min(6).required(),
  });
  return validationSchema.validate(userData);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
