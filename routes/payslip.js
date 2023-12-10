/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

//Dependencies Imported :
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fs = require("fs");
var puppeteer = require("puppeteer");
var handlebars = require("handlebars");
const { validationResult } = require("express-validator");

//Middleware's Imported :
var SF_Pag = require("../middlewares/search_functionality-Pagination");          //Middleware for Search-Functionality and Pagination


//Models Imported :
var Payslip =  require("../models/payslip");
var Invoice = require("../models/invoice");


//Validations Imported :
var Payslip_Validator = require("../validations/payslip_validations");


//Importing Constants :
var constants_function = require("../constants/constants");
var constants = constants_function("payslip");


//Crud Operations :


// GET Request :
router.get("/",SF_Pag(Payslip), async(req, res)=>{

    //Response :
    res.status(200).json({
        "status": {
            "success": true,
            "code": 200,
            "message": constants.SUCCESSFUL
        },
        "data": res.Results
    });
});




//POST Request for pdf generation :
router.post("/", Payslip_Validator(), async(req, res)=>{

    //Error Handling for Validations :
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        //Respose for Validation Error :
        console.log(errors.array());
        return res.status(400).json({
            "status": {
                "success": false,
                "code": 400,
                "message": errors.array()[0].msg
            }
        });
    }

    //Taking Input Body :
    const {    
    candidate,
    candidate_id,
    type,
    date,
    Designation,
    assigned,
    Basic,
    D_allow,
    HR_allow,
    Bonus,
    conveyance,
    others,
    total_earnings,
    prof_tax,
    p_f_employer,
    p_f_employee,
    total_tax,
    td_S,other_tax,
    net_deductions,
    net_salary,
    remarks,isActive} = req.body;

    //payslip body : 
    const payslip_data = {
        _id: new mongoose.Types.ObjectId(),
        candidate,
        candidate_id,
        type,
        date,
        Designation,
        assigned,
        Basic,
        D_allow,
        HR_allow,
        Bonus,
        conveyance,
        others,
        total_earnings,
        prof_tax,
        p_f_employer,
        p_f_employee,
        total_tax,
        td_S,other_tax,
        net_deductions,
        net_salary,
        remarks,
        isActive
    };

    //Template Path : 
    var template_path =  __dirname.replace("routes", "templates") + "/" + "payslip.html";

    //Reading HTML file :
    var templateHtml = fs.readFileSync(template_path, "utf-8");

    //Assigning values to HTML :
    var template = handlebars.compile(templateHtml);
    var finalHtml = encodeURIComponent(template(payslip_data));

    //Format of our pdf :
    var options = {
        format: "A4",
        printBackground: true
    };

    //Launching Browser :
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true
    });
    const page = await browser.newPage();

    //Launching our HTML page in browser :
    await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
        waitUntil: "networkidle0"
    });

    //Creating PDF with our format :
    const pdf = await page.pdf(options);

    //Converting buffer type to base64 format :
    const base64 = Buffer.from(pdf).toString("base64");

    //Closing Browser :
    await browser.close();

    //Saving payslip Body to mongodb :
    const payslip =  new Payslip(payslip_data);
    const new_payslip = await payslip.save();

    //Response :
    res.status(201).send({
        "status": {
            "success": true,
            "code": 201,
            "message": constants.MODEL_CREATE
        },
        "pdf": base64,
        "data": new_payslip
    });
});



//GET Request for payslip ID :
router.get("/:payslip_id", async(req, res)=>{
    
    try{

        //Finding payslip by ID :
        const id = req.params.payslip_id;
        const payslip = await Payslip.findOne({_id:id,isActive:true});

        if (payslip ==  null) {

            //Response if payslip not found :
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        } else {

            //Response :
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 200,
                    "message": constants.SUCCESSFUL
                },
                "data": payslip
            });
        }

    //Error Catching :
    }catch(err){
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
        console.log(err);
    }
});



//DELETE Request for payslip ID :
router.delete("/:payslip_id", async(req, res)=>{
    
    try{

        //Finding paysliip :
        const id = req.params.payslip_id;
        const payslip = await Payslip.findById(id);
        if (payslip ==  null) {
            //Response if payslip not found :
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        } else {

            //Deleting payslip :
           await Payslip.findByIdAndUpdate(id, { isActive: false });
            //Response :
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 204,
                    "message": constants.MODEL_DELETE
                }
            });
        }

    //Error Catching :
    }catch(err){
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
        console.log(err);
    }
});

//PATCH Request for client ID :
router.put("/:payslip_id", Payslip_Validator(), async (req, res) => {

    //Error Handling for Validations :
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        //Respose for Validation Error :
        return res.status(400).json({
            "status": {
                "success": false,
                "code": 400,
                "message": errors.array()[0].msg
            }
        });
    }
    try {

        //Finding client by ID :
        const id = req.params.payslip_id;
        let payslip = await Payslip.findOne({ _id: id, isActive: true });

        if (payslip == null) {
            //Response if client not found :
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            
            });
        } else {
            
            payslip = await Payslip.findByIdAndUpdate(id,req.body);
            //Response :
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 204,
                    "message": constants.MODEL_UPDATED
                },
                
            });
        }

        //Error Catching :
    } catch (err) {
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
        console.log(err);
    }
});


router.get("/filter/:newdate", async (req, res) => {

    try {

        //Finding schedule by ID :
        const id = req.params.newdate;
        const filterdate = await Payslip.find({ date : id, isActive: true });

        if (filterdate == null) {

            //Response if schedule not found :
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        } else {

            //Response :
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 200,
                    "message": constants.SUCCESSFUL
                },
                "data": filterdate
            });
        }

        //Error Catching :
    } catch (err) {
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
        console.log(err);
    }
});

function getMonths(mon){
    return new Date(mon).getMonth()+1
 } 

 function getyears(mon){
    return new Date(mon).getFullYear()
 } 
 
async function getData(frmdate,tdate,fromdate,todate){
    const returnData={
      totalAmount:0,
      gST:0,
      tDs:0,
      salaries:0,
      payslipList:[],
      invoiceList:[]
    };
    var invoiceData =  await Invoice.find({isActive: true });
    var filterData =invoiceData.filter(function(a) {
        tempDate=a.date
        tempDate=tempDate+"Z"
        var temp = new Date(tempDate);
        if(temp>=frmdate && temp<=tdate){
            return true
        }
        return false
    });
for(i=0;i<filterData.length;i++)
{
    var amount = filterData[i].balance_due
    amount=amount.replace(/\₹|,/g, "");
    amount=amount.replace(/\£|,/g, "");
    
    if (amount== "" || amount =="NaN"){
        amount=0}
    if(amount[2]=="$"){
        amount=amount.replace(/\$|,/g, "");
        amount=amount.replace(/U/g, "");
        amount=amount.replace(/S/g, "");
    }
    returnData.totalAmount+=parseInt(amount)
    if(filterData[i].gstAmount){
        filterData[i].gstAmount.replace("\u20b9", "")
        returnData.gST+=parseInt(filterData[i].gstAmount)
    }
    // if(!filterData[i].gstAmount){
    //     amount=amount*(1-filterData[i].tax)
    //     returnData.gST+=parseInt(filterData[i].gstAmount)
    // }
}

var salaryData =  await Payslip.find({isActive: true });
var filterData =salaryData.filter(function(a) {
    tempDate=a.date
    tempDate=tempDate+"Z"
    var temp = new Date(tempDate);
    if(temp>=frmdate && temp<=tdate){
        return true
    }
    return false
});

for(i=0;i<filterData.length;i++)
{
var amount = filterData[i].net_salary
var tds = filterData[i].td_S
returnData.salaries+=parseFloat(amount)
returnData.tDs+=parseFloat(tds)
}

    var total = (getMonths(todate)-getMonths(fromdate)+1) + 12*(getyears(todate)-getyears(fromdate))

    currmnth=getMonths(fromdate)
    curryear=getyears(fromdate)
    var salaryData =  await Payslip.find({isActive: true});
    for (var i=0;i<total;i++){
    var temp =salaryData.filter(function(a) {
    tempMonth=getMonths(a.date)
    tempYear=getyears(a.date)
    if(tempMonth === currmnth && tempYear === curryear){
        return true
    }
    return false
    });
    (returnData.payslipList).push(temp)
    
    if(currmnth<12){
    currmnth+=1
    }
    else{
    currmnth-=12
    curryear+=1        
    }
}
    currmnth=getMonths(fromdate)
    curryear=getyears(fromdate)
    var salaryData =  await Invoice.find({isActive: true});
    for (var i=0;i<total;i++){
    temp =salaryData.filter(function(a) {
    tempMonth=getMonths(a.date)
    tempYear=getyears(a.date)
    if(tempMonth === currmnth && tempYear === curryear){
        return true
    }
    return false
    });
    (returnData.invoiceList).push(temp)

    if(currmnth<12){
    currmnth+=1
    }
    else{
    currmnth-=12
    curryear+=1        
    }
    }
return returnData

}
router.post("/total/", async (req, res) => {
    const {
    fromdate,
    todate
    } = req.body

    const state={fromdate,todate};
    const startmnth =getMonths(state.fromdate);
    const endmnth = getMonths(state.todate);
    const startyear = getyears(state.fromdate)
    const endyear = getyears(state.todate)
    var frmdate = startyear+"-"+startmnth+"Z";
    frmdate=new Date(frmdate)
    var tdate=new Date(endyear,endmnth)

    const ans= await getData(frmdate,tdate,fromdate,todate)

    //Response :
        res.status(201).send({
            "status": {
                "success": true,
                "code": 201,
                "message": constants.MODEL_CREATE
            },
            "data": ans
        });
});

async function gethalfData(frmdate,tdate){

    const returnData={
      gST:0,
      tDs:0,
      salaries:0  
    };
    var invoiceData =  await Invoice.find({isActive: true });
    var filterData =invoiceData.filter(function(a) {
        tempDate=a.date
        tempDate=tempDate+"Z"
        var temp = new Date(tempDate);
        if(temp>=frmdate && temp<=tdate){
            return true
        }
        return false
    });
for(i=0;i<filterData.length;i++)
{  
    if(filterData[i].gstAmount){
        filterData[i].gstAmount.replace("\u20b9", "")
        returnData.gST+=parseInt(filterData[i].gstAmount)
    } 
}

var salaryData =  await Payslip.find({isActive: true });
var filterData =salaryData.filter(function(a) {
    tempDate=a.date
    tempDate=tempDate+"Z"
    var temp = new Date(tempDate);
    if(temp>=frmdate && temp<=tdate){
        return true
    }
    return false
});
for(i=0;i<filterData.length;i++)
{
var amount = filterData[i].net_salary
var tds = filterData[i].td_S
returnData.salaries+=parseFloat(amount)
returnData.tDs+=parseFloat(tds)
}


return returnData
}

router.post("/half/", async (req, res) => {
    const {
    fromdate,
    todate
    } = req.body

    const state={fromdate,todate};
    const startmnth =getMonths(state.fromdate);
    const endmnth = getMonths(state.todate);
    const startyear = getyears(state.fromdate)
    const endyear = getyears(state.todate)
    var frmdate = startyear+"-"+startmnth+"Z";
    frmdate=new Date(frmdate)
    var tdate=new Date(endyear,endmnth)


    const ans= await gethalfData(frmdate,tdate)

        res.status(201).send({
            "status": {
                "success": true,
                "code": 201,
                "message": constants.MODEL_CREATE
            },
            "data": ans
        });
});

router.post("/tds/", async (req, res) => {

    try {
        const {
            fromdate,
            todate
            } = req.body
    
        const state={fromdate,todate};
        const ans= await gettdsData(state)
        
            //Response :
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 200,
                    "message": constants.SUCCESSFUL
                },
                "data": ans
            });
        


        //Error Catching :
    } catch (err) {
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
        console.log(err);
    }
});

async function gettdsData(state){

    const returnData={
        fullTimedata:[],
        internData:[]
    };
        var total = (getMonths(state.todate)-getMonths(state.fromdate)+1) + 12*(getyears(state.todate)-getyears(state.fromdate))
        currmnth=getMonths(state.fromdate)
        curryear=getyears(state.fromdate)
    var salaryData =  await Payslip.find({isActive: true, type:"Full-Time"});
    var amount=0
    for (var i=0;i<total;i++){
        var temp =salaryData.filter(function(a) {
        tempMonth=getMonths(a.date)
        tempYear=getyears(a.date)
        if(tempMonth === currmnth && tempYear === curryear){
            return true
        }
        return false
    });
    let sum=0
    temp.map(a=>
        sum+=parseFloat(a.td_S))
    temp.push(sum)
   
    var x= parseFloat(amount) + parseFloat((sum));
    amount=x.toFixed(2)
    if(temp.length!=0){(returnData.fullTimedata).push(temp)
    }
    if(currmnth<12){
        currmnth+=1
    }
    else{
        currmnth-=12
        curryear+=1        
    }
}
(returnData.fullTimedata).push(amount)
currmnth=getMonths(state.fromdate)
curryear=getyears(state.fromdate)
amount=0
var salaryData =  await Payslip.find({isActive: true, type:"Internship"});
    for (var i=0;i<total;i++){
        var temp =salaryData.filter(function(a) {
        tempMonth=getMonths(a.date)
        tempYear=getyears(a.date)
        if(tempMonth === currmnth && tempYear === curryear){
            return true
        }
        return false
    });
    sum=0
    temp.map(a=>
        sum+=parseFloat(a.td_S))
    temp.push(sum)
   
    x= parseFloat(amount) + parseFloat((sum));
    amount=x.toFixed(2)

    if(temp.length!=0){(returnData.internData).push(temp)
    }
    if(currmnth<12){
        currmnth+=1
    }
    else{
        currmnth-=12
        curryear+=1        
    }
}
(returnData.internData).push(amount)
return returnData
}

module.exports = router;