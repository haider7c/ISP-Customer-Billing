import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { fetchInvoices } from "../Redux/invoiceReducer.js"; // Ensure path is correct
import NavBar from "../Frontcomponents/NavBar.jsx";
import Footer from "../Frontcomponents/Footer.jsx";
import Form from "../Frontcomponents/Form.jsx"; // Use the Form component
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { invoices, error, isLoading } = useSelector((state) => state.Invoice);

  const [editingInvoice, setEditingInvoice] = useState(null);

  // Fetch invoices on component mount
  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const BASE_URL = "http://localhost:5000"; // Replace with your backend URL

  const reloadInvoices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/invoices`);
      dispatch(fetchInvoices(response.data)); // Update Redux state with latest invoices
    } catch (error) {
      console.error("Error reloading invoices:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/invoices/${id}`);
      await reloadInvoices(); // Reload invoices after successful delete
      toast.success("Invoice successfully deleted.");
    } catch (error) {
      console.error(
        "Error deleting invoice:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete invoice.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-5">
        <h1 className="text-2xl font-bold mb-5">Manage Invoices</h1>
        {isLoading ? (
          <p>Loading invoices...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Invoice ID</th>
                <th className="border px-4 py-2">Customer</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{invoice.serialNumb}</td>
                  <td className="border px-4 py-2">{invoice.billTo}</td>
                  <td className="border px-4 py-2">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2 flex justify-around">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={
                        () =>
                          setEditingInvoice(JSON.parse(JSON.stringify(invoice))) // Pass a deep copy
                      }
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(invoice._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {editingInvoice && (
          <div className="mt-5">
            <Form
              key={editingInvoice._id} // Add key to force re-render
              invoice={editingInvoice} // Pass deep copy of the invoice
              reloadInvoices={reloadInvoices}
              setEditingInvoice={setEditingInvoice}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrdersPage;
