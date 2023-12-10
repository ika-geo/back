module.exports = function constants(model){

    //Constants Json :
    const constants = {
        
        //Request Succesful (Status Code: 200) :
        SUCCESSFUL: "request successful",

        //Request Un-Succesful (Status Code: 400) :
        UN_SUCCESSFUL: "request un-successful",

        //Not found (Status Code: 404) :
        MODEL_NOT_FOUND: model + " not found",

        //Not found (Status Code: 404) :
        MODELS_NOT_FOUND: "No "+ model +"s",

        //Post request (Status code: 201) :
        MODEL_CREATE: "request successful, " + model + " created succesfully",

        //Patch request (Status code: 200) :
        MODEL_UPDATED: "request successful, " + model + " updated succesfully",

        //delete request (Status code: 200) :
        MODEL_DELETE: "request successful, " + model + " deleted succesfully",

        //Authorization Failed (Status Code: 401) :
        AUTHORIZATION_FAILED: "authorization failed, enter valid username or password",

        //Not Authorized to perform a request (Status Code: 401) :
        NOT_AUTHORIZED: "you are not authorized to perform this request",

        //Authorization Succesful (Status Code: 200) :
        AUTHORIZATION_SUCCESFUL: "authorization Succesful",
    };

    return constants;
};