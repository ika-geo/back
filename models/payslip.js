const mongoose = require("mongoose");

const { Schema } = mongoose;

const payrollSchema = new Schema({
    candidate: {
        type: String,
        required: true,
    },
    candidate_id: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    pan_number: {
        type: String
    },
    type: {
        type: String,
    },
    assigned_to: {
        type: String,
    },
    basic: {
        type: Number, // Assuming basic salary is a number
    },
    da: {
        type: Number,
    },
    hra: {
        type: Number,
    },
    bonus: {
        type: Number,
    },
    conveyance: {
        type: Number,
    },
    others: {
        type: Number,
    },
    total_earnings: {
        type: Number,
    },
    professional_tax: {
        type: Number,
    },
    epf_employee: {
        type: Number,
    },
    epf_employer: {
        type: Number,
    },
    total_tax: {
        type: Number,
    },
    tds: {
        type: Number,
    },
    other_tax: {
        type: Number,
    },
    net_deductions: {
        type: Number,
    },
    net_salary: {
        type: Number,
    },
    date: {
        type: Date, // Assuming date is a Date type
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    remarks: {
        type: String,
        required: false,
    },
    is_active: {
        type: Boolean,
        default: true,
    }
});

payrollSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const Payslip = mongoose.model('Payslip', payrollSchema);

module.exports = Payslip;