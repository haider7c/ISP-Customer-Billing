import React, { useEffect, useState } from "react";
import axios from "axios";
import Form from "../Frontcomponents/Form.jsx";

const ManageCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [searchField, setSearchField] = useState("customerName");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const handleUpdate = async (updatedCustomer) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/customers/${updatedCustomer._id}`,
        updatedCustomer
      );
      setCustomers((prev) =>
        prev.map((c) => (c._id === updatedCustomer._id ? res.data.updatedCustomer : c))
      );
      setSelectedCustomer(res.data.updatedCustomer);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    (customer[searchField] || "")
      .toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex max-w-7xl mx-auto h-[80vh] border rounded shadow">
      {/* Left Side - Customer List */}
      <div className="w-1/2 overflow-y-auto border-r p-4">
        <h2 className="text-lg font-bold mb-2">📋 All Customers</h2>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
          <select
            className="border rounded p-2 w-full md:w-auto"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="customerName">Name</option>
            <option value="customerId">Customer ID</option>
            <option value="cnic">CNIC</option>
            <option value="packageName">Package</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded p-2 w-full md:w-1/2"
          />
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredCustomers.map((customer) => (
              <li
                key={customer._id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setEditMode(false);
                }}
                className={`p-2 border rounded cursor-pointer hover:bg-blue-100 ${
                  selectedCustomer?._id === customer._id ? "bg-blue-200" : ""
                }`}
              >
                <p className="font-semibold">{customer.customerName}</p>
                <p className="text-sm text-gray-600">{customer.customerId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Side - Detail or Edit View */}
      <div className="w-1/2 p-6">
        {selectedCustomer ? (
          editMode ? (
            <Form
              initialData={selectedCustomer}
              onSubmit={handleUpdate}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">
                👤 {selectedCustomer.customerName}
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Customer ID:</strong> {selectedCustomer.customerId}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedCustomer.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedCustomer.email}
                </p>
                <p>
                  <strong>CNIC:</strong> {selectedCustomer.cnic}
                </p>
                <p>
                  <strong>Address:</strong> {selectedCustomer.address}
                </p>
                <p>
                  <strong>Package:</strong> {selectedCustomer.packageName}
                </p>
                <p>
                  <strong>Amount:</strong> Rs. {selectedCustomer.amount || "N/A"}
                </p>
                <p>
                  <strong>Bill Status:</strong>{" "}
                  {selectedCustomer.billStatus ? (
                    <span className="text-green-600 font-bold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-bold">Unpaid</span>
                  )}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedCustomer.paymentMethod || "N/A"}
                </p>
                <p>
                  <strong>Payment Note:</strong>{" "}
                  {selectedCustomer.paymentNote || "—"}
                </p>
                <p>
                  <strong>Bill Receive Date:</strong>{" "}
                  {new Date(selectedCustomer.billReceiveDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Expiry Date:</strong>{" "}
                  {new Date(selectedCustomer.expiryDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedCustomer._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </>
          )
        ) : (
          <div className="text-gray-500 italic">
            Click on a customer to view details.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCustomer;
