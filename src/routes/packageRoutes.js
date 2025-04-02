const express = require("express");
const router = express.Router();
const Package = require("../models/Package");

// GET all packages
router.get("/", async (req, res) => {
  const packages = await Package.find();
  res.json(packages);
});

// POST new package
router.post("/", async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json(pkg);
});

// PUT update package
router.put("/:id", async (req, res) => {
  const updated = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE package
router.delete("/:id", async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ message: "Package deleted" });
});

module.exports = router;
