var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const { validationResult } = require("express-validator");
var Schedule = require("../models/schedule");
var Client = require("../models/client");
var SF_Pag = require("../middlewares/search_functionality-Pagination");
var Schedule_Validator = require("../validations/schedule_validations");
var constants_function = require("../constants/constants");
var constants = constants_function("schedule");

const query = ["date", "invoiceNumber"];
router.get("/", SF_Pag(Schedule, query), async (req, res) => {
    res.status(200).json({
        "status": {
            "success": true,
            "code": 200,
            "message": constants.SUCCESSFUL
        },
        "data": res.Results
    });
});

router.post("/", Schedule_Validator(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({
            "status": {
                "success": false,
                "code": 400,
                "message": errors.array()[0].msg
            }
        });
    }
    try {
        const { isDisabled, clientId, invoiceNumber, date, frequency, time } = req.body;
        const scheduleName = await getScheduleName(clientId);
        const schedule = new Schedule({
            _id: new mongoose.Types.ObjectId(),
            isDisabled, clientId, scheduleName, invoiceNumber, date, frequency, time
        });
        const new_schedule = await schedule.save();
        res.status(200).json({
            "status": {
                "success": true,
                "code": 201,
                "message": constants.MODEL_CREATE
            },
            "data": new_schedule
        });
    }
    catch (err) {
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

router.get("/:schedule_id", async (req, res) => {
    try {
        const id = req.params.schedule_id;
        const schedule = await Schedule.findOne({ _id: id, isActive: true });
        if (!schedule) {
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        }
        else {
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 200,
                    "message": constants.SUCCESSFUL
                },
                "data": schedule
            });
        }
    }
    catch (err) {
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


const getScheduleName = async (clientId) => {
    try {
        let scheduleName = "";
        const schedule = await Schedule.find({ clientId });
        const client = await Client.findOne({ _id: clientId });
        if (schedule && schedule.length) {
            scheduleName = `${client.client_name}--CU--${schedule.length + 1}`;
            return scheduleName;
        }
        return `${client.client_name}--CU--01`;
    }
    catch (err) {
        throw "unable to get the client info";
    }
};

router.patch("/:schedule_id", Schedule_Validator(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            "status": {
                "success": false,
                "code": 400,
                "message": errors.array()[0].msg
            }
        });
    }
    try {
        const id = req.params.schedule_id;
        var schedule = await Schedule.findOne({ _id: id, isActive: true });
        if (!schedule) {
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        } else {
            const { isDisabled, clientId, invoiceNumber, date, frequency, time } = req.body;
            schedule.isDisabled = isDisabled;
            schedule.clientId = clientId;
            schedule.invoiceNumber = invoiceNumber;
            schedule.date = date;
            schedule.frequency = frequency;
            schedule.time = time;
            const new_schedule = await schedule.save();
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 204,
                    "message": constants.MODEL_UPDATED
                },
                "data": new_schedule
            });
        }
    }
    catch (err) {
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

router.delete("/:schedule_id", async (req, res) => {
    try {
        const id = req.params.schedule_id;
        const schedule = await Schedule.findById(id);
        if (!schedule) {
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        }
        else {
            await Schedule.findByIdAndUpdate(id, { isActive: false });
            res.status(200).json({
                "status": {
                    "success": true,
                    "code": 204,
                    "message": constants.MODEL_DELETE
                }
            });
        }
    }
    catch (err) {
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

module.exports = router;