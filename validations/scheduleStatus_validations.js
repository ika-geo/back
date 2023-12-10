const { check } = require("express-validator");
module.exports = function ScheduleStatus_validator() {

    return [
        check("scheduleId")
            .notEmpty().withMessage("Please enter scheduleId").bail(),
        
        check("invoiceId")
            .notEmpty().withMessage("Please enter scheduleId").bail(),
        
        check("status")
            .notEmpty().withMessage("Please enter endMailStatus").bail(),
    ];
};