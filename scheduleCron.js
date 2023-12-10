"use strict";
require("./app");
const nodeCron = require("node-cron");
const invoice = require("./models/invoice");
const schedule = require("./models/schedule");
var nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
var fs = require("fs");
var handlebars = require("handlebars");
const ScheduleStatus = require("./models/scheduleStatus");
const moment = require("moment");
var scheduleStatus=[] ;

const filterSchedules = async () =>{
    var filteredSchedules=[];
    var scheduleFilter = await schedule.find({isActive: true});
    scheduleFilter.filter(function(item) {
        if(item.frequency=== "Daily" && item.isDisabled === false && moment(item.date).isBefore(new Date())){
            scheduleStatus.push({date: new Date().toDateString() ,scheduleId: item._id, invoiceId: "", status: "Schedule Fetched Successfully"});
            filteredSchedules.push(item);
        }
    });
    scheduleFilter.filter(function(item) {
        if(item.frequency=== "Monthly" && item.isDisabled === false && moment(item.date).isBefore(new Date()) && new Date(item.date).getDate() === new Date().getDate()){
            scheduleStatus.push({date: new Date().toDateString() ,scheduleId: item._id, invoiceId: "",status: "Schedule Fetched Successfully"});
            filteredSchedules.push(item);
        }
    });
    scheduleFilter.filter(function(item) {
        if(item.frequency=== "Weekly" && item.isDisabled === false && moment(item.date).isBefore(new Date()) && new Date().toDateString().split(" ")[0] === new Date(item.date).toDateString().split(" ")[0]){
            scheduleStatus.push({date: new Date().toDateString() ,scheduleId: item._id, invoiceId: "",status: "Schedule Fetched Successfully"});
            filteredSchedules.push(item);
        }
    });
    scheduleFilter.filter(function(item) {
        if(item.frequency=== "Anually" && item.isDisabled === false && moment(item.date).isBefore(new Date()) && new Date(item.date).getDate() === new Date().getDate() && new Date(item.date).getMonth() === new Date().getMonth() ){
            scheduleStatus.push({date: new Date().toDateString() ,scheduleId: item._id, invoiceId: "",status: "Schedule Fetched Successfully"});
            filteredSchedules.push(item);
        }
    });
    return filteredSchedules;
};
 
async function filterInvoices(filteredSchedules) {
    var filteredInvoices = [];
    var invoiceFilter;
    for(let i =0 ; i< filteredSchedules.length ; i++){
        invoiceFilter = await invoice.find({_id : filteredSchedules[i].invoiceNumber, isActive : true});
        try{
            invoiceFilter.forEach((item) => {
                var newInvoice = {...item};
                newInvoice = newInvoice._doc;
                newInvoice.date = new Date().toDateString();
                scheduleStatus[i].status="Invoice Details fetched";
                scheduleStatus[i].invoiceId=filteredSchedules[i].invoiceNumber;
                filteredInvoices.push(newInvoice);
            });
            
        }
        catch(err){
            scheduleStatus[i].status="Failed to fetch invoice details";
        }
        
    }
    return filteredInvoices;
}
const sendMail = async(filteredInvoices) => {
    const invoices = [];
    var findInvoiceById;
    for (var i = 0; i < filteredInvoices.length; i++) {
        invoices.push({
            filename: `${filteredInvoices[i]._id}.pdf`,
            path: "invoicePdfs" + "/" + `${filteredInvoices[i]._id}.pdf`,
        });
    }
    console.log("ready to send mails");
    var transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        secure: true,
        auth: {
            user: "codeunity.test@gmail.com",
            pass: "beparojilxrzcwyc"
        }
    });
    var mailOptions = {
        from: "CodeUnity Technologies private Limited",
        to: "satish.chadive@gmail.com",
        subject: "CodeUnity Technologies invoices today",
        text: "Hello Auditor, Please find the attached invoices  below",
        attachments: invoices,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully");
        for(i=0;i<filteredInvoices.length;i++){
            findInvoiceById=scheduleStatus.filter(obj => obj.invoiceId == filteredInvoices[i]._id);
            findInvoiceById[0].status="Successfully sent mails";
        }
    }
    catch (error) {
        console.log("Email not sent");
        console.log(error);
        for(i=0;i<filteredInvoices.length;i++){
            findInvoiceById=scheduleStatus.filter(obj => obj.invoiceId == filteredInvoices[i]._id);
            findInvoiceById[0].status="Failed to send Mail";
        }
    }
};
const invoicePdfsGeneration = async (filteredInvoices) => {
    var findInvoiceById;
    for (var i = 0; i < filteredInvoices.length; i++){
        try{
            await generatePdf(filteredInvoices[i]);
            findInvoiceById=scheduleStatus.filter(obj => obj.invoiceId == filteredInvoices[i]._id);
            findInvoiceById[0].status="Pdf Generated successfully";
        } 
        catch(err){
            console.log(err);
            findInvoiceById=scheduleStatus.filter(obj => obj.invoiceId == filteredInvoices[i]._id);
            findInvoiceById[0].status="Pdf Generation failed";        
        }
    }
        
};
async function generatePdf(invoiceData) {
    const newInvoiceData = {...invoiceData};
    try {
        var template_path = "templates/invoice.html";
        var templateHtml = fs.readFileSync(template_path, "utf-8");
        var template = handlebars.compile(templateHtml);
        var finalHtml = template(newInvoiceData);
        const pdfpath = "invoicePdfs" + "/" + `${invoiceData._id}.pdf`;
        const options = {
            path: pdfpath ,
            format: "A4" ,
            printBackground: true,
        };
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(finalHtml);
        await page.pdf(options);
        await browser.close();
        return true;
    } 
    catch (err) {
        console.error(err);
        return false;
    }
}

const deleteGenereatedPdfs = async (filteredInvoices) => {
    for (var i = 0; i < filteredInvoices.length; i++) {
        await fs.unlink("invoicePdfs" + "/" + `${filteredInvoices[i]._id}.pdf`, function (err) {
            if (err)
                console.log("Files Deletion Unsuccessful");
            else
                console.log("Files Deleted Successfully");
        });
    }
};
const procedure = async() => {
    var filteredSchedulesForToday = await filterSchedules();
    var invoicesToSend = await filterInvoices(filteredSchedulesForToday);
    await invoicePdfsGeneration(invoicesToSend);
    await sendMail(invoicesToSend);
    await deleteGenereatedPdfs(invoicesToSend);
    await ScheduleStatus.insertMany(scheduleStatus);
}; 
nodeCron.schedule("1 * * * * *", procedure);
