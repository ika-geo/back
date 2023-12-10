//Dependencies Imported :
var mongoose = require('mongoose')

//Models Imported :
var Client = require('../models/client')

//Invoice Schema :
var invoiceSchema = mongoose.Schema({
  //Object ID : (Unique ID, automatically created by MongoDb)
  _id: mongoose.Schema.Types.ObjectId,

  //Validation for client :
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Client,
    required: [true, 'Please select the client'],
  },

  //Validation for Invoice Number :
  invoice_number: {
    type: String,
    required: [true, 'Please enter invoice number'],
  },

  //Validation for Bill from :
  bill_from: {
    type: String,
    required: [true, 'Please enter bill from'],
  },

  //Validation for address :
  bill_to: {
    type: String,
    required: [true, 'please enter bill to'],
  },

  //Validation for shipping address :
  ship_to: {
    type: String,
    required: false,
  },

  //Validation for payment terms :
  payment_terms: {
    type: String,
    required: [true, 'please enter payment terms'],
  },

  //Validation for date :
  date: {
    type: String,
    required: [true, 'Please Enter Date'],
  },
  //Validation for month
  month: {
    type: String,
    required: false,
  },
  //Validation for year
  year: {
    type: String,
    required: false,
  },
  //Validation for due date :
  due_date: {
    type: String,
    required: [true, 'Please Enter Due Date'],
  },

  //Validation for items :
  items: [
    {
      //Not creating id :
      _id: false,

      //Validation for item :
      item: {
        type: String,
        required: [true, 'Please enter item'],
      },

      //Validation for quantity :
      quantity: {
        type: String,
        required: [true, 'Please enter quantity'],
      },

      //Validation for rate :
      rate: {
        type: String,
        required: [true, 'Please enter rate'],
      },

      //Validation for rate :
      amount: {
        type: String,
        required: [true, 'Please enter amount'],
      },
    },
  ],

  //Validation for sub total :
  sub_total: {
    type: String,
    required: [true, 'Please enter sub total'],
  },

  //Validation for tax :
  tax: {
    type: String,
    required: false,
  },

  //Validation for total :
  total: {
    type: String,
    required: [true, 'Please enter total'],
  },

  //Validation for discount :
  discount: {
    type: String,
    required: false,
  },

  //Validation for Amount Paid :
  amount_paid: {
    type: String,
    required: [true, 'Please enter amount paid'],
  },

  //Validation for Balance Due :
  balance_due: {
    type: String,
    required: [true, 'Please enter balance due'],
  },

  //Validation for notes :
  notes: {
    type: String,
    required: false,
  },

  //Validation for terms :
  terms: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  //validation for paid
  paid: {
    type: Boolean,
    required: false,
  },
  //validation for LUT
  is_lut: {
    type: Boolean,
    default:false,
    required: false,
  },
  //validation for GST
  gst_paid: {
    type: Boolean,
    default:false,
    required: false,
  },
  //validation for TDS
  tds_paid: {
    type: Boolean,
    default:false,
    required: false,
  },
  //validation for currency
  currency: {
    type: String,
    required: false,
  },
  //validation for tax-type
  tax_type: {
    type: String,
    required: false,
  },
  //validation for discount-type
  discount_type: {
    type: String,
    required: false,
  },
}) 

module.exports = mongoose.model('Invoice', invoiceSchema)
