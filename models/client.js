const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  client_name: {
    type: String,
    required: true,
  },
  billing_address: String,

  shipping_address: String,

  date_of_contract: Date,

  payment_terms: String,

  notes: String,

  terms: String,

  is_active: {
    type: Boolean,
    default: true,
  },
  toEmails: {
    type: [String],
    default: [],
  },

  ccEmails: {
    type: [String],
    default: [],
  },

  email_content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  isLut:{
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("Client", clientSchema);
