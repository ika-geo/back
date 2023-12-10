var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Candidate = require("../models/candidate");
var constants_function = require("../constants/constants");
var constants = constants_function("candidate");
var { validationResult } = require("express-validator");
var Candidate_Validator = require("../validations/candidate_validations");

router.post('/', async (req, res) => {
    try {
        const candidate = new Candidate(req.body);
        const savedCandidate = await candidate.save();
        res.json(savedCandidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCandidate = await Candidate.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCandidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Candidate.findByIdAndDelete(id);
        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;