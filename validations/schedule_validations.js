const { check } = require("express-validator");
module.exports = function schedule_validator() {

    return [
        check("isDisabled")
            .notEmpty().withMessage("Please enter disabled status").bail(),

        check("clientId")
            .notEmpty().withMessage("Please enter client").bail(),

        check("invoiceNumber")
            .notEmpty().withMessage("Please enter invoice number").bail(),

        check("date")
            .notEmpty().withMessage("Please enter date").bail(),

        check("frequency")
            .notEmpty().withMessage("Please enter frequency").bail(),

        check("time")
            .notEmpty().withMessage("Please enter time").bail(),
    ];
};