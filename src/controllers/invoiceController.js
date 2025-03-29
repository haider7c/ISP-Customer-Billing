const Invoice = require("../models/Invoice");

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create an invoice
const createInvoice = async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ message: "Invalid Data" });
  }
};

module.exports = { getInvoices, createInvoice };
