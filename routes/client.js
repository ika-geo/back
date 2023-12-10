const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Client = require("../models/client");
const { body, validationResult } = require("express-validator");
const client_validator = require('../validations/client_validations')

// Validation for the POST route
const validation = [
  body("client_name").notEmpty().withMessage("Client name is required"),
  body("email_content").notEmpty().withMessage("Email content is required"),
];

// Create a new client
router.post('/', client_validator(), async (req, res) => {
    // check for validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //Respose for Validation Error :
      return res.status(400).json({
        status: {
          success: false,
          code: 400,
          message: errors.array()[0].msg,
        },
      });
    }
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.json(savedClient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a client by ID
router.put('/:id', client_validator(), async (req, res) => {
  const id = req.params.id;
  // check for validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //Respose for Validation Error :
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: errors.array()[0].msg,
      },
    });
  }

  try {
    const updatedClient = await Client.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a client by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Client.findByIdAndDelete(id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a client by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
