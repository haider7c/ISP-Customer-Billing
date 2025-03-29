const express = require("express");
const router = express.Router();
const Counter = require("../models/Counter");

// Serial number route logic
router.post("/getSerialNumber", async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create a document if none exists
    );

    const paddedSerial = String(counter.value).padStart(6, "0");

    res.status(200).json({ serialNumber: paddedSerial });
  } catch (error) {
    console.error("Failed to generate serial number:", error);
    res.status(500).json({ error: "Failed to generate serial number" });
  }
});

module.exports = router;
