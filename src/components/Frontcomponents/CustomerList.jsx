import React, { useEffect, useState } from 'react';
import { fetchcustomers, updateCustomer } from '../api';

const CustomerList = () => {
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    const FetchCustomer = async () => {
      try {
        const data = await fetchcustomers();
        setCustomerData(data);
      } catch (error) {
        console.log('Error while fetching Customers', error);
      }
    };
    FetchCustomer();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // Filter today's bills and pending older bills
  const todaysBills = customerData.filter(c =>
    c.billDate?.split('T')[0] === today && !c.billStatus
  );

  const pendingBills = customerData.filter(c =>
    c.billDate?.split('T')[0] < today && !c.billStatus
  );

  // Mark bill as received
  const markAsPaid = async (id) => {
    try {
      await updateCustomer(id, { billStatus: true });
      setCustomerData(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to mark bill as received:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Customer Bills</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today’s Bills */}
        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-3">Today’s Bills</h3>
          {todaysBills.length === 0 && <p className="text-gray-500">No bills for today.</p>}
          {todaysBills.map(item => (
            <div key={item._id} className="mb-4 p-3 border rounded bg-green-50 shadow-sm">
              <p><strong>Name:</strong> {item.customerName}</p>
              <p><strong>Phone:</strong> {item.phone}</p>
              <p><strong>Bill Date:</strong> {item.billDate?.split('T')[0]}</p>
              <button
                onClick={() => markAsPaid(item._id)}
                className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mark Bill Received
              </button>
            </div>
          ))}
        </div>

        {/* Pending Bills */}
        <div>
          <h3 className="text-xl font-semibold text-red-700 mb-3">Pending Bills</h3>
          {pendingBills.length === 0 && <p className="text-gray-500">No pending bills.</p>}
          {pendingBills.map(item => (
            <div key={item._id} className="mb-4 p-3 border rounded bg-red-50 shadow-sm">
              <p><strong>Name:</strong> {item.customerName}</p>
              <p><strong>Phone:</strong> {item.phone}</p>
              <p><strong>Bill Date:</strong> {item.billDate?.split('T')[0]}</p>
              <button
                onClick={() => markAsPaid(item._id)}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Mark Bill Received
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
