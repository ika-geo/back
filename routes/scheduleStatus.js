var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const { validationResult } = require("express-validator");
var ScheduleStatus = require("../models/scheduleStatus");
var SF_Pag = require("../middlewares/search_functionality-Pagination");
var ScheduleStatus_Validator = require("../validations/scheduleStatus_validations");
var constants_function = require("../constants/constants");
var constants = constants_function("scheduleStatus");

const query = ["scheduleId"];
router.get("/", SF_Pag(ScheduleStatus, query), async (req, res) => {
    res.status(200).json({
        "status": {
            "success": true,
            "code": 200,
            "message": constants.SUCCESSFUL
        },
        "data": res.Results
    });
});

router.post("/", ScheduleStatus_Validator(), async (req, res) => {
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
        const { scheduleId, invoiceId, status } = req.body;
        const scheduleStatus = new ScheduleStatus({
            _id: new mongoose.Types.ObjectId(),
            date: new Date().toDateString(),
            scheduleId,invoiceId, status,
        });
        const new_scheduleStatus = await scheduleStatus.save();
        res.status(200).json({
            "status": {
                "success": true,
                "code": 201,
                "message": constants.MODEL_CREATE
            },
            "data": new_scheduleStatus
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

router.get("/:scheduleStatus_id", async (req, res) => {
    try {
        const id = req.params.scheduleStatus_id;
        const ScheduleStatus = await ScheduleStatus.findOne({ _id: id, isActive: true });
        if (!ScheduleStatus) {
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
                "data": ScheduleStatus
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


router.delete("/:scheduleStatus_id", async (req, res) => {
    try {
        const id = req.params.scheduleStatus_id;
        const ScheduleStatus = await ScheduleStatus.findById(id);
        if (!ScheduleStatus) {
            res.status(404).json({
                "status": {
                    "success": false,
                    "code": 404,
                    "message": constants.MODEL_NOT_FOUND
                }
            });
        }
        else {
            await ScheduleStatus.findByIdAndUpdate(id, { isActive: false });
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