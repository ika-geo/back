const { body, validationResult } = require('express-validator');

const payslipValidationRules = () => {
    return [
        body('candidate').notEmpty().withMessage('Candidate name is required'),
        body('candidate_id').notEmpty().withMessage('Candidate ID is required'),
        body('designation').notEmpty().withMessage('Designation is required'),
        body('pan_number').notEmpty().withMessage('PAN number is required'),
        body('type').notEmpty().withMessage('Employment type is required'),
        body('basic').isNumeric().withMessage('Basic salary must be a number'),
        body('da').optional().isNumeric().withMessage('DA must be a number'),
        body('hra').optional().isNumeric().withMessage('HRA must be a number'),
        body('bonus').optional().isNumeric().withMessage('Bonus must be a number'),
        body('conveyance').optional().isNumeric().withMessage('Conveyance must be a number'),
        body('others').optional().isNumeric().withMessage('Others must be a number'),
        body('total_earnings').optional().isNumeric().withMessage('Total earnings must be a number'),
        body('professional_tax').optional().isNumeric().withMessage('Professional tax must be a number'),
        body('epf_employee').optional().isNumeric().withMessage('EPF (Employee) must be a number'),
        body('epf_employer').optional().isNumeric().withMessage('EPF (Employer) must be a number'),
        body('total_tax').optional().isNumeric().withMessage('Total tax must be a number'),
        body('tds').optional().isNumeric().withMessage('TDS must be a number'),
        body('other_tax').optional().isNumeric().withMessage('Other tax must be a number'),
        body('net_deductions').optional().isNumeric().withMessage('Net deductions must be a number'),
        body('net_salary').optional().isNumeric().withMessage('Net salary must be a number'),
        body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
        body('remarks').optional(),
        body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
};

module.exports = {
    payslipValidationRules,
    validate,
};
