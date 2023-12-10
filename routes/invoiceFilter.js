var express = require("express");
var router = express.Router();
var fs = require("fs");
var handlebars = require("handlebars");
var nodemailer = require("nodemailer");
var pdf = require("html-pdf");
const utils = require("util");
const puppeteer = require("puppeteer");
const readFile = utils.promisify(fs.readFile);
const { validationResult } = require("express-validator");

//Validations Imported :
var invoiceFilterValidator = require("../validations/invoiceFilter_validations");

//require models
var Invoice = require("../models/invoice");

//Importing Constants :
var constants_function = require("../constants/constants");
var constants = constants_function("invoice");

//function for reading  the html file
async function getTemplateHtml() {
  //Template Path :
  var template_path = path.join(__dirname, "..", "templates", "invoice.html");
  try {
    return await readFile(template_path, "utf8");
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

handlebars.registerHelper("areEqual", function (val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

//Function for Invoice Pdf's Generation
async function generatePdf(invoiceData, month, year) {
  try {
    let res = await getTemplateHtml();
    // Now we have the html code of our template in res object
    // we have compile our code with handlebars
    const template = handlebars.compile(res, { strict: true });
    // We can use this to add dyamic data to our handlebas template at run time from database or API as per need.
    const result = template(invoiceData);
    const html = result;
    // we are using headless mode
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // We set the page content as the generated html by handlebars
    await page.setContent(html);
    // We use pdf function to generate the pdf in the desired folder
    const pdfpath =
      __dirname.replace("routes", "Invoices") +
      "/" +
      `${invoiceData.invoice_number}-${month}-${year}.pdf`;

    //format of our pdf is A4
    await page.pdf({ path: pdfpath, format: "A4", printBackground: true });
    await browser.close();
    console.log("PDF Generated");
  } catch (error) {
    console.log(error);
    return error;
  }
}

//for loop for pdf Generation
const invoicePdfsGeneration = async (invoiceData, month, year) => {
  for (var i = 0; i < invoiceData.length; i++)
    await generatePdf(invoiceData[i], month, year);
};

//function for sending the Generated invoices pdf via provided mail

//It takes an object as parameter, the object structure is as follows
/*
  {   
        from: A valid from address email id 
        
        password: password of the from address email id 
        
        to: [] An array of receivers email ids [at least one email id should be there]

        cc: [] An array of cc email ids  [if there are no cc emails pass empty array]

        bcc : [] An array of bcc email ids  [if there are no bcc emails pass empty array]

        subject: subject of Email [if there is no subject pass empty string]

        body:content of the Email [if there is no content pass empty string] 

        attachments : [  
                       { 
                          filename : attachment name,
                          path : path of the attachment
                        }
                     ]  An array of objects,
       If there are no attachments pass empty array
  }  
*/
const sendingInvoicesViaMail = async (obj) => {
  var transporter = await nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: obj.from,
      pass: obj.password,
    },
  });

  var mailOptions = {
    from: "CodeUnity Technologies private Limited",
    to: obj.to,
    cc: obj.cc,
    bcc: obj.bcc,
    subject: obj.subject,
    text: obj.body,
    attachments: obj.attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfullly");
  } catch (error) {
    return error;
  }
};

//Function to delete the generated PDF's
const deleteGenereatedPdfs = async (invoiceData, month, year) => {
  for (var i = 0; i < invoiceData.length; i++) {
    await fs.unlink(
      __dirname.replace("routes", "Invoices") +
        "/" +
        `${invoiceData[i].invoice_number}-${month}-${year}.pdf`,
      function (err) {
        if (err) console.log("Files Deletion Unsuccessful");
        else console.log("Files Deleted Successfully");
      }
    );
  }
};

//post request for invoice pdf generation and mailing
router.post("/", invoiceFilterValidator(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //Respose for Validation Error :
    console.log(errors.array());
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: errors.array()[0].msg,
      },
    });
  }

  const { toEmails, ccEmails, month, year, invoiceData } = req.body;

  //calling the pdf's generation function
  const pdfError = await invoicePdfsGeneration(invoiceData, month, year);

  //response, when pdf generation failed
  if (pdfError) {
    console.log(pdfError);
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: "pdf generation Failed",
      },
    });
  }

  //storing the generated pdfs, with filename and path for sending pdfs as attachments
  const invoices = [];
  for (var i = 0; i < invoiceData.length; i++) {
    invoices.push({
      filename: `${invoiceData[i].invoice_number}-${month}-${year}.pdf`,
      path:
        __dirname.replace("routes", "Invoices") +
        "/" +
        `${invoiceData[i].invoice_number}-${month}-${year}.pdf`,
    });
  }

  //calling the mail sending function
  const mailParameters = {
    from: "angajalaanuradha@gmail.com",
    password: "cjanewwnuagsifrn",
    to: toEmails,
    cc: ccEmails,
    bcc: [],
    subject: `Codeunity Technologies GST Invoices Report for ${month} - ${year}`,
    body: `Hello Auditor, Please find the attached invoices for the ${month} - ${year} below`,
    attachments: invoices,
  };
  const emailError = await sendingInvoicesViaMail(mailParameters);

  //Delete the pdf files generated
  await deleteGenereatedPdfs(invoiceData, month, year);

  //response, when the email sending unsuccessful due to poor connectivity or any other problems
  if (emailError) {
    console.log(emailError);
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: "Email not sent, Network Error",
      },
    });
  }

  //response for successful email sent
  return res.status(200).json({
    status: {
      success: true,
      code: 200,
      message: "Invoices sent successfully",
    },
  });
});

// GET Request for obtaining filteredData by month and year
router.get("/:newmonth/:newyear", async (req, res) => {
  try {
    const mnth = req.params.newmonth;
    const yr = req.params.newyear;
    console.log(mnth, yr);
    const filteredData = await Invoice.find({
      month: mnth,
      year: yr,
      isActive: true,
    });
    res.status(200).json({
      status: {
        success: true,
        code: 200,
        message: "Invoices Fetched Successfully",
      },
      data: filteredData,
    });
  } catch (err) {
    res.status(500).json({
      status: {
        success: false,
        code: 500,
        message: err.message,
      },
    });
    console.log(err);
  }
});

module.exports = {
  router: router,
  getTemplateHtml: getTemplateHtml,
  generatePdf: generatePdf,
  sendingInvoicesViaMail: sendingInvoicesViaMail,
};
