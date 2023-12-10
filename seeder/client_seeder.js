//Dependencies Imported :
var mongoose = require("mongoose");


//Models Imported :
var Client = require("../models/client");


//Middleware's Imported :
var config = require("../config/config.json");


//Importing Constants :
var constants_function = require("../constants/constants");
var constants = constants_function("admin");


//MongoDb Connection :
mongoose.connect(config.MONGO_URL,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true},function(err, conn){
    if(err){
        console.log("mongodb connection error", err);
    }
    if(!err && conn){
        console.log("mongodb connection established");
    }
});


//Admin Credentials to add to mongodb: 
var client = [
    new Client({
        _id: new mongoose.Types.ObjectId(),
          //Validation for client name :
    client_name: "Treniq ",

    billing_address: "1/32, Brahmin Street",

    shipping_address:  "1/32, Brahmin Street",

    date_of_contract: "12/12/12",

    payment_terms: "jdnjknjksdndsjnk",

    notes: "kjdnsjkjsdjnids",

    terms: "jnesjhnjhsdnjsnhj",
    }),     
];


//Creating new Admin :
var done = 0;
for (var i=0; i<client.length; i++) {
    client[i].save(function(err) {
        if (!err)
        {
            console.log({
                "status": {
                    "success": true,
                    "code": 200,
                    "message": constants.MODEL_CREATE
                }
            });
        }
        if(err) {
            console.log({
                "status": {
                    "success": false,
                    "code": 400,
                    "message": constants.UN_SUCCESSFUL
                },
                "error": err
            });
        }
        done++;
        if (done === client.length) {
            exit();
        }
    });
}


//Disconnecting Mongoose :
function exit() {
    mongoose.disconnect(function(err){
        if(!err){
            console.log("mongo connection disconnected");
        }
        if(err){
            console.log("error in disconnecting mongodb");
        }
    });
}