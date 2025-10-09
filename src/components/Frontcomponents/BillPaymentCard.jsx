import React, { useMemo, useState } from "react";
import BillStatus from "./BillStatus.jsx";
import { X, Printer, Search, Copy } from "lucide-react";
import { PDFViewer, pdf } from '@react-pdf/renderer';
import ReceiptPDF from '../pages/Templates/ReceiptPDF.jsx';
import { toast } from 'react-toastify';

const BillPaymentCard = ({
  customers,
  billStatuses,
  selectedMonth,
  selectedYear,
  loading,
  refreshBillStatuses,
  searchTerm,
  sectionTitle,
  onSendReceipt
}) => {
  // Debug: Log incoming data
  console.log('=== BILL PAYMENT CARD DEBUG ===');
  console.log('BillStatuses:', billStatuses);
  console.log('Customers:', customers);

  // Create a map of bill statuses by customer ID
  const billStatusMap = useMemo(() => {
    const map = {};
    billStatuses.forEach((status) => {
      const customerId = status.customerId?._id || status.customerId;
      if (customerId) {
        map[customerId] = status;
        console.log(`Status for customer ${customerId}:`, {
          transactionId: status.transactionId,
          paymentAmount: status.paymentAmount,
          paymentDate: status.paymentDate,
          received: status.received
        });
      }
    });
    return map;
  }, [billStatuses]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState("");

  // Merge customer data with their bill status for selected month
  const customerBills = useMemo(() => {
    const merged = customers.map((customer) => {
      const status = billStatusMap[customer._id];
      const mergedCustomer = {
        ...customer,
        billStatus: status ? status.billStatus : false,
        paymentMethod: status ? status.paymentMethod : "",
        paymentNote: status ? status.paymentNote : "",
        transactionId: status ? status.transactionId : "",
        paymentAmount: status ? status.paymentAmount : null,
        paymentDate: status ? status.paymentDate : null,
        billStatusId: status ? status._id : null,
      };
      
      console.log(`Merged customer ${customer.customerName}:`, {
        transactionId: mergedCustomer.transactionId,
        paymentAmount: mergedCustomer.paymentAmount,
        hasStatus: !!status
      });
      
      return mergedCustomer;
    });
    
    console.log('Final merged customer bills:', merged);
    return merged;
  }, [customers, billStatusMap]);

  // Rest of your component remains the same...
  // Filter by transaction ID
  const filteredPaidBills = useMemo(() => {
    let paidBills = customerBills.filter((c) => c.billStatus);
    
    if (transactionSearch.trim()) {
      const searchLower = transactionSearch.toLowerCase();
      paidBills = paidBills.filter(customer => 
        customer.transactionId?.toLowerCase().includes(searchLower) ||
        customer.customerName?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchLower)
      );
    }
    
    return paidBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [customerBills, transactionSearch]);

  // Sorting functions
  const sortByDateDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  // Filter bills
  const unpaidBills = customerBills
    .filter((c) => !c.billStatus)
    .sort(sortByDateDesc);

  const paidBills = customerBills
    .filter((c) => c.billStatus)
    .sort(sortByDateDesc);

  // Safe function to handle send receipt
  const handleSendReceipt = (customer) => {
    if (onSendReceipt && typeof onSendReceipt === 'function') {
      onSendReceipt(customer);
    } else {
      console.warn('onSendReceipt is not available');
      toast.error('Send receipt functionality is not available at the moment.');
    }
  };

  // Copy transaction ID to clipboard
  const copyTransactionId = (transactionId) => {
    if (!transactionId) {
      toast.error('No Transaction ID available');
      return;
    }
    navigator.clipboard.writeText(transactionId)
      .then(() => toast.success('Transaction ID copied to clipboard!'))
      .catch(() => toast.error('Failed to copy Transaction ID'));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
        <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  const handlePrint = async () => {
    const blob = await pdf(<ReceiptPDF customer={selectedCustomer} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    win.print();
  };

  return (
    <div className="space-y-6">
      {/* Search Info Banner */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Showing {customers.length} customers matching "{searchTerm}"
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Unpaid Bills Section */}
        <div>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Unpaid Bills ({unpaidBills.length})
          </h3>
          {unpaidBills.length === 0 ? (
            <div className="p-6 text-center bg-red-50 rounded-lg">
              <p>
                All bills are paid for {selectedMonth}/{selectedYear}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unpaidBills.map((customer) => (
                <div
                  key={customer._id}
                  className="p-4 border rounded-lg bg-red-50 shadow-sm"
                >
                  <p>
                    <strong>Name:</strong> {customer.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {customer.phone}
                  </p>
                  <p>
                    <strong>Customer ID:</strong> {customer.customerId}
                  </p>
                  <p>
                    <strong>CNIC:</strong> {customer.cnic}
                  </p>
                  <p>
                    <strong>Package:</strong> {customer.packageName}
                  </p>
                  <p>
                    <strong>Amount:</strong> Rs. {customer.amount}
                  </p>
                  <BillStatus
                    customer={customer}
                    month={selectedMonth}
                    year={selectedYear}
                    refreshBillStatuses={refreshBillStatuses}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paid Bills Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-green-700">
              Paid Bills ({paidBills.length})
            </h3>
            
            {/* Transaction Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by TXN ID, name, phone..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="pl-8 pr-4 py-1 border rounded text-sm w-64"
              />
              <Search size={16} className="absolute left-2 top-1.5 text-gray-400" />
              {transactionSearch && (
                <button
                  onClick={() => setTransactionSearch("")}
                  className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {filteredPaidBills.length === 0 ? (
            <div className="p-6 text-center bg-green-50 rounded-lg">
              {transactionSearch ? (
                <p>No paid bills found matching "{transactionSearch}"</p>
              ) : (
                <p>No bills paid yet for {selectedMonth}/{selectedYear}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPaidBills.map((customer) => (
                <div
                  key={customer._id}
                  className="p-4 border rounded-lg bg-green-50 shadow-sm relative"
                >
                  {/* Transaction ID with copy button */}
                  <div className={`mb-2 p-2 rounded border ${
                    customer.transactionId ? 'bg-white' : 'bg-yellow-100 border-yellow-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">
                        TXN ID:
                      </span>
                      {customer.transactionId && (
                        <button
                          onClick={() => copyTransactionId(customer.transactionId)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy Transaction ID"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>
                    <p className={`text-xs font-mono break-all mt-1 ${
                      customer.transactionId ? 'text-gray-800' : 'text-yellow-700'
                    }`}>
                      {customer.transactionId || 'No Transaction ID Recorded'}
                    </p>
                    {!customer.transactionId && (
                      <p className="text-xs text-yellow-600 mt-1">
                        This payment was recorded before transaction tracking was added.
                      </p>
                    )}
                  </div>

                  <p>
                    <strong>Name:</strong> {customer.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {customer.phone}
                  </p>
                  <p>
                    <strong>Customer ID:</strong> {customer.customerId}
                  </p>
                  <p>
                    <strong>CNIC:</strong> {customer.cnic}
                  </p>
                  <p>
                    <strong>Package:</strong> {customer.packageName}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> Rs. {customer.paymentAmount || customer.amount}
                  </p>
                  <p>
                    <strong>Method:</strong> {customer.paymentMethod || 'Not specified'}
                  </p>
                  <p>
                    <strong>Paid Date:</strong> {formatDate(customer.paymentDate)}
                  </p>
                  <p>
                    <strong>Note:</strong> {customer.paymentNote || "-"}
                  </p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                      <Printer size={14} />
                      Print
                    </button>
                    
                    <button
                      onClick={() => handleSendReceipt(customer)}
                      className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Resend Receipt
                    </button>
                  </div>

                  {/* Quick action buttons */}
                  {customer.transactionId && (
                    <div className="mt-2 flex justify-between text-xs">
                      <button
                        onClick={() => {
                          toast.info(`Viewing transaction: ${customer.transactionId}`);
                          // You can implement modal or page navigation here
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View TXN
                      </button>
                      
                      <button
                        onClick={() => {
                          // Implement database search functionality
                          window.open(`/api/bill-status/transaction/${customer.transactionId}`, '_blank');
                        }}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Search DB
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Transaction Search Results Info */}
          {transactionSearch && filteredPaidBills.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredPaidBills.length} transaction(s) matching "{transactionSearch}"
            </div>
          )}
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-[250px] h-[320px] relative flex flex-col items-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-1 right-1 text-gray-600 hover:text-black"
            >
              <X size={16} className="text-black" />
            </button>
            <div className="h-[100%] overflow-auto border">
              <PDFViewer width={200} height={260} showToolbar={false}>
                <ReceiptPDF customer={selectedCustomer} />
              </PDFViewer>
            </div>
            <button
              onClick={handlePrint}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 w-full"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPaymentCard;