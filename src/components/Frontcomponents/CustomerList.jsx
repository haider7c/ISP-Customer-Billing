import React, { useEffect, useState } from 'react';
import { fetchCustomers, getBillStatusForMonth } from '../api';
import BillPaymentCard from './BillPaymentCard.jsx';
import { toast } from 'react-toastify';
import axios from 'axios'; // Add this import
import 'react-toastify/dist/ReactToastify.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [todaysCustomers, setTodaysCustomers] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [upcomingCustomers, setUpcomingCustomers] = useState([]);
  const [billStatuses, setBillStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment receipt modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentData, setPaymentData] = useState({ 
    amount: '', 
    method: 'Cash', 
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, selectedDay]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersData, billStatusData] = await Promise.all([
        fetchCustomers(),
        getBillStatusForMonth(selectedMonth, selectedYear)
      ]);
      
      setCustomers(customersData);
      setBillStatuses(billStatusData);
      
      // Categorize customers based on bill day
      categorizeCustomers(customersData, billStatusData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const categorizeCustomers = (customersData, billStatusData) => {
    const today = selectedDay;
    
    // Filter customers based on search term first
    let filtered = customersData;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = customersData.filter(customer => 
        customer.customerName?.toLowerCase().includes(term) ||
        customer.cnic?.toLowerCase().includes(term) ||
        customer.phone?.toLowerCase().includes(term) ||
        customer.customerId?.toLowerCase().includes(term)
      );
    }

    // Today's customers (billReceiveDate = today)
    const todays = filtered.filter(customer => 
      parseInt(customer.billReceiveDate) === today
    );

    // Pending customers (billReceiveDate < today, bill not received)
    const pending = filtered.filter(customer => {
      const billDay = parseInt(customer.billReceiveDate);
      const customerId = customer._id || customer.customerId;
      const hasReceivedBill = billStatusData.some(status => 
        status.customerId === customerId && status.received
      );
      
      return billDay < today && !hasReceivedBill;
    });

    // Upcoming customers (billReceiveDate > today)
    const upcoming = filtered.filter(customer => 
      parseInt(customer.billReceiveDate) > today
    );

    setTodaysCustomers(todays);
    setPendingCustomers(pending);
    setUpcomingCustomers(upcoming);
    setFilteredCustomers(filtered);
  };

  // Refresh when search term changes
  useEffect(() => {
    if (customers.length > 0 && billStatuses.length > 0) {
      categorizeCustomers(customers, billStatuses);
    }
  }, [searchTerm]);

  // Refresh bill statuses after payment
  const refreshBillStatuses = async () => {
    try {
      setRefreshing(true);
      const billStatusData = await getBillStatusForMonth(selectedMonth, selectedYear);
      setBillStatuses(billStatusData);
      categorizeCustomers(customers, billStatusData);
    } catch (error) {
      console.error("Error refreshing bill statuses:", error);
      toast.error("Failed to refresh bill statuses");
    } finally {
      setRefreshing(false);
    }
  };

  // Payment receipt functions
  const openPaymentModal = (customer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: customer.amount || '',
      method: 'Cash',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedCustomer(null);
    setPaymentData({ 
      amount: '', 
      method: 'Cash', 
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    });
  };

  const sendPaymentReceipt = async () => {
    if (!paymentData.amount || !paymentData.method) {
      toast.error('Please enter both amount and payment method');
      return;
    }

    try {
      // First update bill status in database
      await updateBillStatusInDatabase();
      
      // Then send WhatsApp receipt
      const response = await axios.post(
        `http://localhost:5000/api/whatsapp/send-payment-receipt/${selectedCustomer._id}`,
        {
          ...paymentData,
          customerName: selectedCustomer.customerName,
          phone: selectedCustomer.phone,
          packageName: selectedCustomer.packageName,
          month: selectedMonth,
          year: selectedYear
        }
      );
      
      if (response.data.success) {
        toast.success('Payment receipt sent successfully!');
        refreshBillStatuses();
      } else {
        toast.error(`Failed to send receipt: ${response.data.error}`);
      }
      
      closePaymentModal();
    } catch (error) {
      console.error('Error sending payment receipt:', error);
      toast.error('Error sending payment receipt');
    }
  };

  const updateBillStatusInDatabase = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/bill-status/mark-paid', {
        customerId: selectedCustomer._id,
        month: selectedMonth,
        year: selectedYear,
        transactionId: paymentData.transactionId,
        paymentAmount: paymentData.amount,
        paymentMethod: paymentData.method,
        paymentDate: new Date().toISOString()
      });
      
      if (!response.data.success) {
        toast.error(`Failed to update bill status: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Error updating bill status in database');
    }
  };

  // Generate day options (1-31)
  const days = Array.from({length: 31}, (_, i) => i + 1);

  // Generate month options
  const months = Array.from({length: 12}, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', {month: 'long'})
  }));

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 6}, (_, i) => currentYear - 5 + i);

  return (
    <div className='flex flex-col'>
      {/* Payment Receipt Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Send Payment Receipt</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{selectedCustomer.customerName}</p>
              <p className="text-sm text-gray-600">Phone: {selectedCustomer.phone}</p>
              <p className="text-sm">Package: {selectedCustomer.packageName}</p>
              <p className="text-sm">Bill Day: {selectedCustomer.billReceiveDate}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                  className="w-full p-2 border rounded bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={sendPaymentReceipt}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Send Receipt
              </button>
              <button
                onClick={closePaymentModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your CustomerList JSX remains the same */}
      {/* Search Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers by name, CNIC, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Day/Month/Year Selector */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="w-20 p-2 border rounded"
          >
            {days.map(day => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-40 p-2 border rounded"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-32 p-2 border rounded"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Today's Customers Section */}
      <div className="mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <h2 className="text-xl font-bold text-blue-800">
            📅 Today's Customers (Day {selectedDay})
          </h2>
          <p className="text-blue-600">
            {todaysCustomers.length} customer(s) due for payment today
          </p>
        </div>
        
        <BillPaymentCard 
          customers={todaysCustomers}
          billStatuses={billStatuses} 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          loading={loading || refreshing}
          refreshBillStatuses={refreshBillStatuses}
          searchTerm={searchTerm}
          sectionTitle={`Today's Customers (Day ${selectedDay})`}
          onSendReceipt={openPaymentModal}
        />
      </div>

      {/* Pending Customers Section */}
      {pendingCustomers.length > 0 && (
        <div className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <h2 className="text-xl font-bold text-yellow-800">
              ⚠️ Pending Customers (Day 1 to {selectedDay - 1})
            </h2>
            <p className="text-yellow-600">
              {pendingCustomers.length} customer(s) with pending payments from previous days
            </p>
          </div>
          
          <BillPaymentCard 
            customers={pendingCustomers}
            billStatuses={billStatuses} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            loading={loading || refreshing}
            refreshBillStatuses={refreshBillStatuses}
            searchTerm={searchTerm}
            sectionTitle={`Pending Customers (Day 1-${selectedDay - 1})`}
            onSendReceipt={openPaymentModal}
          />
        </div>
      )}

      {/* Upcoming Customers Section */}
      {upcomingCustomers.length > 0 && (
        <div className="mb-8">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <h2 className="text-xl font-bold text-green-800">
              📋 Upcoming Customers (Day {selectedDay + 1} to 31)
            </h2>
            <p className="text-green-600">
              {upcomingCustomers.length} customer(s) with upcoming payments
            </p>
          </div>
          
          <BillPaymentCard 
            customers={upcomingCustomers}
            billStatuses={billStatuses} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            loading={loading || refreshing}
            refreshBillStatuses={refreshBillStatuses}
            searchTerm={searchTerm}
            sectionTitle={`Upcoming Customers (Day ${selectedDay + 1}-31)`}
            onSendReceipt={openPaymentModal}
          />
        </div>
      )}

      {todaysCustomers.length === 0 && pendingCustomers.length === 0 && upcomingCustomers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No customers found for the selected criteria.
        </div>
      )}
    </div>
  );
};

export default CustomerList;