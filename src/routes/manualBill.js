// ✅ Correct version for Node.js with CommonJS (Electron)
const express = require("express");
const ManualBill = require("../models/ManualBill");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newBill = new ManualBill(req.body);
    await newBill.save();
    res.status(201).json({ message: "Bill saved successfully", data: newBill });
  } catch (err) {
    res.status(500).json({ message: "Failed to save bill", error: err });
  }
});

router.get("/", async (req, res) => {
  try {
    const bills = await ManualBill.find();
    res.status(200).json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve bills", error: err });
  }
});

module.exports = router; // ✅ THIS IS ESSENTIAL
