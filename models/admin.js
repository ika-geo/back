/* eslint-disable no-useless-escape */


//Dependencies Imported :
var mongoose = require("mongoose");



//Admin Schema :
var adminSchema = mongoose.Schema({

    //Object ID : (Unique ID, automatically created by MongoDb)
    _id: mongoose.Schema.Types.ObjectId,

    //Validation for admin user name :
    username: {
        type: String,
        unique: [true, "user name already exists"],
        required: [true, "please enter user name"],
        min: [4, "user name should be minimum 4 characters"]
    },

    //Validation for Email :
    email: {
        type: String,
        unique: [true, "email already exists"],
        required: [true, "please enter email address"],
        lowercase: [true, "email address must be lowercase"],
        validate: [
            {
                validator: function(v) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                Error: "please enter a valid email address"
            }
        ]
    },

    //Validation for Password :
    password: {
        type: String,
        required: [true, "please enter password"],
        validate: [
            {
                validator: function(v) {
                    return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(v);
                },
                Error: "invalid password, password must contain 8 characters and include one lowercase, one uppercase, one number"
            }
        ]
    },

    //Validation for phone number :
    phone_number: {
        type: String,
        unique: [true, "phone number already exists"],
        required: [true, "please enter phone number"],
        validate: [
            {
                validator: function(v) {
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: "please enter a valid indian phone number"
            }
        ]
    },
    //Validation for address :
    address:{
        type:String,
        required:false,
    },
    //Validation for logo image :
    logoImage:{
        location:{
            type:String,
            required:false,
        },
        key:{
            type:String,
            required:false,
        }
    }
});



module.exports = mongoose.model("Admin", adminSchema);