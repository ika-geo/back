
var mongoose = require("mongoose");



var scheduleSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,

    isDisabled: {
        type: Boolean,
        required: [true, "please enter Disabled status"]
    },

    scheduleName: {
        type: String,
        required: [true, "please enter schedule name"]
    },

    clientId: {
        type: String,
        required: [true, "please enter client name"]
    },

    invoiceNumber: {
        type: String,
        required: [true, "please enter invoice number"]
    },

    date: {
        type: String,
        required: [true, "please Enter date of schedule"]
    },

    frequency: {
        type: String,
        required: [true, "please enter frequency"]
    },

    time: {
        type: String,
        required: [true, "please enter time"]
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
});



module.exports = mongoose.model("Schedule", scheduleSchema);