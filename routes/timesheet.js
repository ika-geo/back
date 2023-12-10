var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var timesheet = require("../models/timesheet");
var constants_function = require("../constants/constants");
var constants = constants_function("client");
router.post("/", async (req, res) => {
  let requests = req.body;
  try {
    for (let i = 0; i < requests.length; i++) {
      const datas = {
        _id: new mongoose.Types.ObjectId(),
        description: requests[i].description,
        no_of_hours: requests[i].no_of_hours,
        attendance: requests[i].attendance,
        date: requests[i].date,
      };
      const data = new timesheet(datas);
      await data.save();
    }
    res.status(200).json({
      status: {
        success: true,
        code: 200,
        message: constants.SUCCESSFUL,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: err.message,
      },
    });
    console.log("error", err);
  }
});
router.get("/", async (req, res) => {
  let queries = req.query
  try {
    if (queries.from_date && queries.to_date) {
      const from_date = new Date(queries.from_date)
      const to_date = new Date(queries.to_date)
      from_date.setHours(0, 0, 0, 0)
      to_date.setDate(to_date.getDate() + 1)
      to_date.setHours(0, 0, 0, 0)
      const timeSheet = await timesheet.find({ isActive: true })
      const data = timeSheet.filter((data) => data.date > new Date(from_date).toISOString() && data.date < new Date(to_date).toISOString())
      res.status(200).json({
        status: {
          success: true,
          code: 200,
          message: constants.SUCCESSFUL,
          data: data
        },
      });
    }
  } catch (err) {
    res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: err.message,
      },
    });
    console.log("error", err);
  }
});

router.put("/", async (req, res) => {
  let requests = req.body;
  try {
    for (let i = 0; i < requests.length; i++) {
      await timesheet.findByIdAndUpdate(requests[i]._id, {
        _id: requests[i]._id,
        description: requests[i].description,
        no_of_hours: requests[i].no_of_hours,
        attendance: requests[i].attendance,
        date: requests[i].date,
      });
    }
    res.status(200).json({
      status: {
        success: true,
        code: 204,
        message: constants.SUCCESSFUL,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: err.message,
      },
    });
    console.log("error", err);
  }
});
router.delete("/:timesheet_id", async (req, res) => {
  try {
    const id = req.params.timesheet_id;
    await timesheet.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      "status": {
        "success": true,
        "code": 204,
        "message": constants.MODEL_DELETE
      }
    });
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
module.exports = router;
