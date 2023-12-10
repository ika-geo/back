const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: String,
    pan_number: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    assigned_to: {
        type: String,
        required: true
    },
    doj: {
        type: String,
        required: true
    },
    payment_terms: String,
    role: {
        type: String,
        default: "Candidate"
    },
    is_active: {
        type: Boolean,
        default: true
    },
    basic: {
        type: String,
        required: true
    },
    da: {
        type: String,
        required: true
    },
    hra: {
        type: String,
        required: true
    },
    bonus: {
        type: String,
        required: true
    },
    conveyance: {
        type: String,
        required: true
    },
    others: {
        type: String,
        required: true
    },
    total_earnings: {
        type: String,
        required: true
    },
    prof_tax: {
        type: String,
        required: true
    },
    epf_employee: {
        type: String,
        required: true
    },
    epf_employer: {
        type: String,
        required: true
    },
    tds: {
        type: String,
        required: true
    },
    other_tax: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Candidate", candidateSchema);
