//Dependencies Imported :
const { check } = require('express-validator')

//Express Validations for InvoiceFilter
module.exports = function client_validator() {
  return [
    //validation for Receivers Email
    check('toEmails')
      .notEmpty()
      .withMessage('Please Enter a Valid Email Id')
      .bail(),

    //validation for the invoicesData
    check('invoiceData')
      .notEmpty()
      .withMessage('There are no invoices to send Email')
      .bail(),
  ]
}
