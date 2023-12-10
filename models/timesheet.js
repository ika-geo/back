var mongoose = require("mongoose");

// Time Sheet Schema
var timeSheetSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  //Validation for Description
  description: {
    type: String,
    required: [true, "Please Enter Description"],
  },

  //Validation for Number of Hours
  no_of_hours: {
    type: Number,
    required: [true, "Please Enter Number of Hours"],
  },

  //Validation for Attendance
  attendance: {
    type: String,
    required: [true, "Please Enter Attendance"],
  },

  //Validation for Date
  date: {
    type: String,
    required: [true, "Please Enter Date"],
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("TimeSheet", timeSheetSchema);
