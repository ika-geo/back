var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fs = require("fs");
var puppeteer = require("puppeteer");
var handlebars = require("handlebars");
var Payslip = require("../models/payslip");


var constants_function = require("../constants/constants");
var constants = constants_function("payslip");
const { payslipValidationRules, validate } = require('../validations/payslip_validations');  // Adjust the path accordingly

router.post("/tds/", async (req, res) => {
    try {
        const {
            startDate,
            endDate
        } = req.body


        const result = await getTDSReport({
            startDate,
            endDate
        })

        res.status(200).json({
            "status": {
                "success": true,
                "code": 200,
                "message": constants.SUCCESSFUL
            },
            "data": result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            "status": {
                "success": false,
                "code": 500,
                "message": err.message
            }
        });
    }
});


const getTDSReport = async (payload) => {
    const { startDate, endDate } = payload
    let result = await generateTDSReport(startDate, endDate)
    return result
}

async function generateTDSReport(startDate, endDate) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    const report = {
        monthlyData: {},
        totalTDSAmount: 0,
    };

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        const firstDayOfMonth = `${year}-${formattedMonth}-01`;
        const lastDayOfMonth = `${year}-${formattedMonth}-31`;

        const filteredPayslips = await Payslip.find({
            date: {
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth,
            },
        });

        const monthlyReport = {
            fullTimeEmployees: [],
            partTimeInternshipEmployees: [],
            totalTDSAmount: 0,
        };

        filteredPayslips.forEach((payslip) => {
            const formattedEntry = {
                employeeName: payslip.candidate,
                panNumber: payslip.candidate_id,
                grossSalary: payslip.basic + payslip.da + payslip.hra + payslip.bonus + payslip.conveyance + payslip.others,
                advanceTaxTDS: payslip.tds || 0,
            };

            if (payslip.type === 'FULL-TIME') {
                monthlyReport.fullTimeEmployees.push(formattedEntry);
            } else {
                monthlyReport.partTimeInternshipEmployees.push(formattedEntry);
            }
            monthlyReport.totalTDSAmount += formattedEntry.advanceTaxTDS;
        });

        report.monthlyData[`${year}-${formattedMonth}`] = monthlyReport;

        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Calculate the total TDS amount for the entire report
    for (const month in report.monthlyData) {
        report.totalTDSAmount += report.monthlyData[month].totalTDSAmount;
    }

    return report;
}


const getPayslips = async (req, res) => {
    try {
        // Retrieve all Payslips
        const payslips = await Payslip.find();
        res.status(200).json(payslips);
    } catch (error) {
        console.error('Error fetching Payslips:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPayslipById = async (req, res) => {
    const { id } = req.params;
    try {
        // Retrieve a specific Payslip by ID
        const payslip = await Payslip.findById(id);
        if (!payslip) {
            return res.status(404).json({ message: 'Payslip not found' });
        }
        res.status(200).json(payslip);
    } catch (error) {
        console.error('Error fetching Payslip by ID:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updatePayslip = async (req, res) => {
    const { id } = req.params;
    try {
        // Update a Payslip
        const updatedPayslip = await Payslip.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPayslip) {
            return res.status(404).json({ message: 'Payslip not found' });
        }
        res.status(200).json(updatedPayslip);
    } catch (error) {
        console.error('Error updating Payslip:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const createPayslip = async (req, res) => {
    try {
        const {
            candidate,
            candidate_id,
            type,
            date,
            designation,
            assigned_to,
            basic,
            da,
            hra,
            bonus,
            conveyance,
            others,
            total_earnings,
            professional_tax,
            epf_employee,
            epf_employer,
            total_tax,
            tds,
            other_tax,
            net_deductions,
            net_salary,
            remarks,
            isActive
        } = req.body;

        // Payslip body
        const payslip_data = {
            _id: new mongoose.Types.ObjectId(),
            candidate,
            candidate_id,
            type,
            date,
            designation,
            assigned_to,
            basic,
            da,
            hra,
            bonus,
            conveyance,
            others,
            total_earnings,
            professional_tax,
            epf_employee,
            epf_employer,
            total_tax,
            tds,
            other_tax,
            net_deductions,
            net_salary,
            remarks,
            isActive
        };

        // Template Path
        const template_path = __dirname.replace('routes', 'templates') + '/' + 'payslip.html';

        // Reading HTML file
        const templateHtml = fs.readFileSync(template_path, 'utf-8');

        // Assigning values to HTML
        const template = handlebars.compile(templateHtml);
        const finalHtml = encodeURIComponent(template(payslip_data));

        // Format of our pdf
        const options = {
            format: 'A4',
            printBackground: true
        };

        // Launching Browser
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        // Launching our HTML page in browser
        await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
            waitUntil: 'networkidle0'
        });

        // Creating PDF with our format
        const pdf = await page.pdf(options);

        // Converting buffer type to base64 format
        const base64 = Buffer.from(pdf).toString('base64');

        // Closing Browser
        await browser.close();

        // Saving payslip Body to MongoDB
        const payslip = new Payslip(payslip_data);
        const new_payslip = await payslip.save();

        // Response
        res.status(201).send({
            status: {
                success: true,
                code: 201,
                message: 'Payslip created successfully'
            },
            pdf: base64,
            data: new_payslip
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: {
                success: false,
                code: 500,
                message: 'Server error'
            }
        });
    }
}

const deletePayslip = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete a Payslip
        const deletedPayslip = await Payslip.findByIdAndDelete(id);
        if (!deletedPayslip) {
            return res.status(404).json({ message: 'Payslip not found' });
        }
        res.status(200).json({ message: 'Payslip deleted successfully' });
    } catch (error) {
        console.error('Error deleting Payslip:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

router.post(
    '/',
    payslipValidationRules(),
    validate, createPayslip);
router.get('/', getPayslips);

router.get('/:id', getPayslipById);

router.put('/:id', updatePayslip);

router.delete('/:id', deletePayslip);

module.exports = router;
