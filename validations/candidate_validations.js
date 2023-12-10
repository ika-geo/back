const { check } = require("express-validator");


module.exports = function candidate_validator() {

    return [
        check("name")
            .notEmpty().withMessage("Please enter name").bail(),

        check("date_of_birth")
            .notEmpty().withMessage("please enter Date of Birth").bail(),

        check("assigned_to")
            .notEmpty().withMessage("please enter assigned to").bail(),

        check("type")
        .notEmpty().withMessage("please enter assigned to").bail(),

        check("date_of_Joining")
            .notEmpty().withMessage("Please enter Date of Joining").bail(),

        check("Basic")
        .notEmpty().withMessage("Please enter Basic").bail(),

        check("D_allow")
        .notEmpty().withMessage("Please enter DA").bail(),

        check("HR_allow")
        .notEmpty().withMessage("Please enter HRA").bail(),

        check("Bonus")
        .notEmpty().withMessage("Please enter ").bail(),

        check("conveyance")
        .notEmpty().withMessage("Please enter conveyance").bail(),

        check("others")
        .notEmpty().withMessage("Please enter others").bail(),

        check("total_earnings")
        .notEmpty().withMessage("Please enter total_earnings").bail(),

        check("prof_tax")
        .notEmpty().withMessage("Please enter prof_tax").bail(),

        check("p_f_employee")
        .notEmpty().withMessage("Please enter p_f_employee").bail(),

        check("p_f_employer")
        .notEmpty().withMessage("Please enter p_f_employer").bail(),

        check("td_S")
        .notEmpty().withMessage("Please enter td_S").bail(),

        check("other_tax")
        .notEmpty().withMessage("Please enter other_tax").bail(),

        
        check("Designation")
        .notEmpty().withMessage("Please enter Designation").bail(),

        check("pan_no")
        .notEmpty().withMessage("Please enter Pan No").bail(),
    ];
};