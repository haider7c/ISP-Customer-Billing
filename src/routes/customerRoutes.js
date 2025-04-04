const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer"); // Import your Customer model

// CREATE - Add a new customer
router.post("/", async (req, res) => {
  console.log("Received data:", req.body);
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error.message);
    res.status(500).json({ error: "Failed to create customer", details: error.message });
  }
});

// READ - Get all customers
router.get("/", async (req, res) => {
  try {
    console.log("⚡ Fetching customers...");
    const customers = await Customer.find();

    console.log("✅ Found", customers.length, "customers");
    res.json(customers);
  } catch (err) {
    console.error("❌ Error in /api/customers:", err.message);
    res.status(500).json({ error: "Failed to fetch customers", details: err.message });
  }
});


// DELETE - Remove a customer by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Deleting customer with ID:", id);
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      console.error("Customer not found for ID:", id);
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE - Modify customer by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    console.log("Updating customer with ID:", id);
    console.log("Updated data:", updatedData);

    const updatedCustomer = await Customer.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      console.error("Customer not found for ID:", id);
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
