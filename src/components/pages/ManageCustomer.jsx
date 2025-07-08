import React, { useEffect, useState } from "react";
import axios from "axios";
import Form from "../Frontcomponents/Form.jsx";

const ManageCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchField, setSearchField] = useState("customerName");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (updatedCustomer) => {
    try {
      setIsUpdating(true);
      const res = await axios.put(
        `http://localhost:5000/api/customers/${updatedCustomer._id}`,
        updatedCustomer
      );
      setCustomers((prev) =>
        prev.map((c) => (c._id === updatedCustomer._id ? res.data : c))
      );
      setSelectedCustomer(res.data);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating customer:", err);
      alert("Failed to update customer. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    (customer[searchField] || "")
      .toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
  };

  return (
    <div className="flex max-w-7xl mx-auto h-[80vh] border rounded shadow">
      {/* Left Side - Customer List */}
      <div className="w-1/2 overflow-y-auto border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">📋 All Customers</h2>
          <span className="text-sm text-gray-500">
            {filteredCustomers.length} customers
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
          <select
            className="border rounded p-2 w-full md:w-auto text-sm"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="customerName">Name</option>
            <option value="customerId">Customer ID</option>
            <option value="cnic">CNIC</option>
            <option value="packageName">Package</option>
            <option value="phone">Phone</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded p-2 w-full text-sm"
          />
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 border rounded animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No customers found</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-500 mt-2 text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredCustomers.map((customer) => (
              <li
                key={customer._id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setEditMode(false);
                }}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedCustomer?._id === customer._id
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold truncate max-w-[200px]">
                      {customer.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customer.customerId}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      customer.billStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.billStatus ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div className="mt-2 flex text-sm text-gray-500">
                  <span className="mr-3">📱 {customer.phone}</span>
                  <span>📦 {customer.packageName}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Side - Detail or Edit View */}
      <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
        {selectedCustomer ? (
          editMode ? (
            <Form
              initialData={selectedCustomer}
              onSubmit={handleUpdate}
              onCancel={() => setEditMode(false)}
              isSubmitting={isUpdating}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm h-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">
                  👤 {selectedCustomer.customerName}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    disabled={isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCustomer._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <label className="text-gray-500">Customer ID</label>
                    <p className="font-medium">{selectedCustomer.customerId}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Phone</label>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Email</label>
                    <p className="font-medium">{selectedCustomer.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">CNIC</label>
                    <p className="font-medium">{selectedCustomer.cnic}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-gray-500">Package</label>
                    <p className="font-medium">{selectedCustomer.packageName}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Amount</label>
                    <p className="font-medium">
                      Rs. {selectedCustomer.amount || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Bill Status</label>
                    <p className="font-medium">
                      {selectedCustomer.billStatus ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-red-600">Unpaid</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Payment Method</label>
                    <p className="font-medium">
                      {selectedCustomer.paymentMethod || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-gray-500">Address</label>
                  <p className="font-medium mt-1">
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500">Bill Receive Date</label>
                    <p className="font-medium">
                      {formatDate(selectedCustomer.billReceiveDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Expiry Date</label>
                    <p className="font-medium">
                      {formatDate(selectedCustomer.expiryDate)}
                    </p>
                  </div>
                </div>

                {selectedCustomer.paymentNote && (
                  <div>
                    <label className="text-gray-500">Payment Note</label>
                    <p className="font-medium mt-1">
                      {selectedCustomer.paymentNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="mt-4">Select a customer to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCustomer;