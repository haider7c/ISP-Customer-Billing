import React, { useEffect, useState } from 'react';
import { fetchCustomers, getBillStatusForMonth } from '../api';
import BillPaymentCard from './BillPaymentCard.jsx';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [billStatuses, setBillStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersData, billStatusData] = await Promise.all([
        fetchCustomers(),
        getBillStatusForMonth(selectedMonth, selectedYear)
      ]);
      
      setCustomers(customersData);
      setFilteredCustomers(customersData); // Initialize filtered list with all customers
      setBillStatuses(billStatusData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.customerName?.toLowerCase().includes(term) ||
      customer.cnic?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term) ||
      customer.customerId?.toLowerCase().includes(term)
    );

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Refresh bill statuses after payment
  const refreshBillStatuses = async () => {
    try {
      setRefreshing(true);
      const billStatusData = await getBillStatusForMonth(selectedMonth, selectedYear);
      setBillStatuses(billStatusData);
    } catch (error) {
      console.error("Error refreshing bill statuses:", error);
    } finally {
      setRefreshing(false);
    }
  };

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

      {/* Month/Year Selector */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
      
      <BillPaymentCard 
        customers={filteredCustomers}  // Pass filtered customers
        billStatuses={billStatuses} 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        loading={loading || refreshing}
        refreshBillStatuses={refreshBillStatuses}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default CustomerList;