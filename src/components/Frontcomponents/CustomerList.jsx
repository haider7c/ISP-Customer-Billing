import React, { useEffect, useState } from 'react';
import { fetchCustomers, getBillStatusForMonth } from '../api';
import BillPaymentCard from './BillPaymentCard.jsx';
import GoogleSheetReader from './GoogleSheetReader.jsx';

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
    } finally {
      setRefreshing(false);
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