/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */


//Dependencies Imported :
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var path = require("path");
var fs = require("fs");
var puppeteer = require("puppeteer");
var puppeteerCore = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
var handlebars = require("handlebars");
const { validationResult } = require("express-validator");
var invoiceFilter = require("./invoiceFilter");
var nodemailer = require("nodemailer");
const multer = require("multer");
const uploadImageAndSetLogo = require("../file-upload/uploadImageAWS");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

const upload = multer({ storage: multer.memoryStorage() });

//Middleware's Imported :
var SF_Pag = require("../middlewares/search_functionality-Pagination"); //Middleware for Search-Functionality and Pagination

//nvoice Models Imported :
var Invoice = require("../models/invoice");

//client Model imported
var Client = require("../models/client");

//Validations Imported :
var Invoice_Validator = require("../validations/invoice_validations");

//Importing Constants :
var constants_function = require("../constants/constants");
const {uploadToS3} = require("../file-upload/s3");
var constants = constants_function("invoice");

handlebars.registerHelper("areEqual", function (val1, val2, options) {
  if (val1 == val2) return options.fn(this);
  else return options.inverse(this);
});

//Crud Operations :
// GET Request :
router.get("/", SF_Pag(Invoice), async (req, res) => {
  //Response :
  res.status(200).json({
    status: {
      success: true,
      code: 200,
      message: constants.SUCCESSFUL,
    },
    data: res.Results,
  });
});

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
    // text: obj.body,
    html : obj.html,
    attachments: obj.attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfullly");
  } catch (error) {
    return error;
  }
};

// create invoice
router.post("/createInvoice", upload.single("image"), Invoice_Validator(),async (req, res) => {
  //Error Handling for Validations :
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
  await uploadImageAndSetLogo(req, res);

  // Taking Input Body:
  const {
    client,
    invoice_number,
    bill_from,
    bill_to,
    ship_to,
    payment_terms,
    date,
    month,
    year,
    due_date,
    items,
    sub_total,
    tax,
    is_lut,
    discount,
    total,
    amount_paid,
    balance_due,
    notes,
    terms,
    paid,
    currency,
    tax_type,
    discount_type,
  } = req.body;
  //invoice body :
  const invoice_data = {
    _id: new mongoose.Types.ObjectId(),
    client,
    invoice_number,
    bill_from,
    bill_to,
    ship_to,
    payment_terms,
    date,
    month,
    year,
    due_date,
    items,
    sub_total,
    tax,
    is_lut,
    discount,
    total,
    amount_paid,
    balance_due,
    notes,
    terms,
    paid,
    currency,
    tax_type,
    discount_type,
  };


  //Saving Invoice Body to mongodb :
  const invoice = new Invoice(invoice_data);
  const new_invoice = await invoice.save();

  //Response :
  res.status(201).send({
    status: {
      success: true,
      code: 201,
      message: constants.MODEL_CREATE,
    },
    // data: new_invoice,
  });
});

router.post("/:client_id", Invoice_Validator(), async (req, res) => {
  //Error Handling for Validations :
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

  //Taking Input Body :
  const {
    client,
    invoice_number,
    bill_from,
    bill_to,
    ship_to,
    payment_terms,
    date,
    month,
    year,
    due_date,
    items,
    sub_total,
    tax,
    discount,
    total,
    amount_paid,
    balance_due,
    notes,
    terms,
    paid,
    currency,
    tax_type,
    discount_type,
  } = req.body;

  //invoice body :
  const invoice_data = {
    _id: new mongoose.Types.ObjectId(),
    client,
    invoice_number,
    bill_from,
    bill_to,
    ship_to,
    payment_terms,
    date,
    month,
    year,
    due_date,
    items,
    sub_total,
    tax,
    discount,
    total,
    amount_paid,
    balance_due,
    notes,
    terms,
    paid,
    currency,
    tax_type,
    discount_type,
  };

  //Fetching the toEmails and ccEmails of the provided client
  try {
    //Finding client by client_name :
    const clientId = req.params.client_id;
    const client = await Client.findOne({
      _id: clientId,
      isActive: true,
    });

    //Response if client not found :
    if (client == null) {
      res.status(404).json({
        status: {
          success: false,
          code: 404,
          message: `No Client`,
        },
      });
    }

    //Response on valid Client
    else {
      //reading the template html file
      invoiceFilter.getTemplateHtml();

      //generating the invoice pdf
      const pdfError = await invoiceFilter.generatePdf(
        invoice_data,
        month,
        year
      );

      //If there is any error in generating pdf
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

      //Generated pdf file name and path, for sending pdf as attachment
      const invoiceDetails = [
        {
          filename: `${invoice_number}-${month}-${year}.pdf`,
          path:
            __dirname.replace("routes", "Invoices") +
            "/" +
            `${invoice_number}-${month}-${year}.pdf`,
        },
      ];

      //providing the mail parameters
      const obj = {
        from: "angajalaanuradha@gmail.com",
        password: "cjanewwnuagsifrn",
        to: client.toEmails,
        cc: client.ccEmails,
        bcc: [],
        subject: `Generated Invoice`,
        // body: "Hello Auditor,Please find the generated invoice below",
        html: `<html><body>${client.emailContent}</body></html>`,
        attachments: invoiceDetails,
      };

      //sending the mail
      const emailError = await sendingInvoicesViaMail(obj);

      //deleting the generated pdf
      fs.unlink(
        __dirname.replace("routes", "Invoices") +
          "/" +
          `${invoice_number}-${month}-${year}.pdf`,
        function (err) {
          if (err) console.log("Files Deletion Unsuccessful");
          else console.log("Files Deleted Successfully");
        }
      );

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

      //saving the generated invoice to database
      const invoice = new Invoice(invoice_data);
      const new_invoice = await invoice.save();

      //response for successful email sent
      return res.status(200).json({
        status: {
          success: true,
          code: 200,
          message: "Invoices sent successfully",
        },
      });
    }
  } catch (err) {
    //Error Catching :
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

//POST Request for pdf generation :
router.post("/", upload.single("image"), Invoice_Validator(), async (req, res) => {
  //Error Handling for Validations :
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

  try {
    await uploadImageAndSetLogo(req, res);

    const adminFromToken = jwt.verify(req.body.token.replace("Bearer ", ""), "1234");
    const admin = await Admin.findById(adminFromToken.adminId);
    const logoImage = admin.logoImage.location;

    //Taking Input Body :
    const {
      client,
      invoice_number,
      bill_from,
      bill_to,
      ship_to,
      payment_terms,
      date,
      month,
      year,
      due_date,
      items,
      sub_total,
      tax,
      discount,
      total,
      amount_paid,
      balance_due,
      notes,
      terms,
      paid,
      currency,
      tax_type,
      discount_type,
    } = req.body;
    //invoice body :
    const invoice_data = {
      _id: new mongoose.Types.ObjectId(),
      client,
      invoice_number,
      bill_from,
      bill_to,
      ship_to,
      payment_terms,
      date,
      month,
      year,
      due_date,
      items,
      sub_total,
      tax,
      discount,
      total,
      amount_paid,
      balance_due,
      notes,
      terms,
      paid,
      currency,
      tax_type,
      discount_type,
      image: logoImage
    };
    console.log(currency);
    console.log(typeof currency);
    //Template Path :
    var template_path = path.join(__dirname, "..", "templates", "invoice.html");

    //Reading HTML file :
    var templateHtml = fs.readFileSync(template_path, "utf-8");

    //Assigning values to HTML :
    var template = handlebars.compile(templateHtml);
    var finalHtml = encodeURIComponent(template(invoice_data));





    //Format of our pdf :
    var options = {
      format: "A4",
      printBackground: true,
    };
    let browser = null;
    console.log(1);
    // Launching Browser

    // console.log(2);
    // browser = await puppeteer.launch({
    //   args: ["--no-sandbox"],
    //   headless: true,
    // });

    // browser = await chromium.puppeteer.launch({
    //   args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath,
    //   headless: false,
    //   ignoreHTTPSErrors: true,
    // })



    const LOCAL_CHROME_EXECUTABLE = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    const executablePath = await chromium.executablePath || LOCAL_CHROME_EXECUTABLE;

    browser = await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: false,
    });











    console.log(3);
    const page = await browser.newPage();
    console.log(4);
    // Navigate to the HTML content
    await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
      waitUntil: "networkidle0",
    });

    console.log(5);
    // Create PDF with specified options
    const pdf = await page.pdf(options);
    console.log(6);
    //Converting buffer type to base64 format :
    const base64 = Buffer.from(pdf).toString("base64");
    // Closing Browser
    await browser.close();
    console.log(7);

    //Response :
    res.status(201).send({
      status: {
        success: true,
        code: 201,
        message: constants.MODEL_CREATE,
      },
      pdf: base64,
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

//GET Request for Invoice ID :
router.get("/:invoice_id", async (req, res) => {
  try {
    //Finding invoice by ID :
    const id = req.params.invoice_id;
    const invoice = await Invoice.findOne({ _id: id, isActive: true });

    if (invoice == null) {
      //Response if invoice not found :
      res.status(404).json({
        status: {
          success: false,
          code: 404,
          message: constants.MODEL_NOT_FOUND,
        },
      });
    } else {
      //Response :
      res.status(200).json({
        status: {
          success: true,
          code: 200,
          message: constants.SUCCESSFUL,
        },
        data: invoice,
      });
    }

    //Error Catching :
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

//DELETE Request for invoice ID :
router.delete("/:invoice_id", async (req, res) => {
  try {
    //Finding invoice :
    const id = req.params.invoice_id;
    const invoice = await Invoice.findById(id);
    if (invoice == null) {
      //Response if invoice not found :
      res.status(404).json({
        status: {
          success: false,
          code: 404,
          message: constants.MODEL_NOT_FOUND,
        },
      });
    } else {
      //Deleting invoice :

      await Invoice.findByIdAndDelete(id, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          //Response :
          res.status(200).json({
            status: {
              success: true,
              code: 204,
              message: constants.MODEL_DELETE,
            },
          });
        }
      });
      //Response :
      // res.status(200).json({
      //           "status": {
      //               "success": true,
      //               "code": 204,
      //               "message": constants.MODEL_DELETE
      //           }
      //       });
    }

    //Error Catching :
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

router.put("/:invoice_id", Invoice_Validator(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: errors.array()[0].msg,
      },
    });
  }
  try {
    const id = req.params.invoice_id;
    let invoice = await Invoice.findOne({ _id: id, isActive: true });
    if (!invoice) {
      res.status(404).json({
        status: {
          success: false,
          code: 404,
          message: constants.MODEL_NOT_FOUND,
        },
      });
    } else {
      await Invoice.findByIdAndUpdate(id, req.body);
      res.status(200).json({
        status: {
          success: true,
          code: 204,
          message: constants.MODEL_UPDATED,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: {
        success: false,
        code: 500,
        message: err.message,
      },
    });
  }
});

module.exports = router;
