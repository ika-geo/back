//Dependencies Imported :
const { check } = require("express-validator");

//Express Validations for client :
module.exports = function client_validator() {
  return [
    //Validation for client name :
    check("client_name")
      .notEmpty()
      .withMessage("Please enter client name")
      .bail(),

    //Validation for address :
    check("billing_address")
      .notEmpty()
      .withMessage("Please enter Bill To")
      .bail(),

    //Validation for shipping address
    check("shipping_address")
      .notEmpty()
      .withMessage("Please enter Ship To")
      .bail(),

    //Validation for date of contract :
    check("date_of_contract")
      .notEmpty()
      .withMessage("Please enter date of contract")
      .bail(),

    //Validation for payment terms :
    check("payment_terms")
      .notEmpty()
      .withMessage("Please enter payment terms")
      .bail(),

    //validation for Receivers Email
    check("toEmails")
        .isArray({ min: 1 })
        .withMessage("Please provide at least one email address")
        .bail(),

    // validation for Receivers Email/emails is/are email
    check("toEmails.*")
        .isEmail()
        .withMessage("Invalid email address/addresses")
        .bail(),

    // validation for CC Email is email
    // check("ccEmails")
    //     .isEmail()
    //     .withMessage("Invalid email address")
    //     .bail(),

    //Validation for the EmailContent
    check("email_content")
      .notEmpty()
      .withMessage("Please enter the email content for sending invoices")
      .bail(),
  ];
};
