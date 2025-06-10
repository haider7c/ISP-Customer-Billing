import React, { useMemo,useState } from "react";
import BillStatus from "./BillStatus.jsx";
import { X, Printer } from "lucide-react";
import { PDFViewer, pdf } from '@react-pdf/renderer';
import ReceiptPDF from '../pages/Templates/ReceiptPDF.jsx';

const BillPaymentCard = ({
  customers,
  billStatuses,
  selectedMonth,
  selectedYear,
  loading,
  refreshBillStatuses,
  searchTerm,
}) => {
  // Create a map of bill statuses by customer ID
  const billStatusMap = useMemo(() => {
    const map = {};
    billStatuses.forEach((status) => {
      const customerId = status.customerId?._id || status.customerId;
      if (customerId) {
        map[customerId] = status;
      }
    });
    return map;
  }, [billStatuses]);

   const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Merge customer data with their bill status for selected month
  const customerBills = useMemo(() => {
    return customers.map((customer) => {
      const status = billStatusMap[customer._id];

      return {
        ...customer,
        billStatus: status ? status.billStatus : false,
        paymentMethod: status ? status.paymentMethod : "",
        paymentNote: status ? status.paymentNote : "",
        billStatusId: status ? status._id : null,
      };
    });
  }, [customers, billStatusMap]);

  // Sorting functions
  const sortByDateDesc = (a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt);

  // Filter bills
  const unpaidBills = customerBills
    .filter((c) => !c.billStatus)
    .sort(sortByDateDesc);

  const paidBills = customerBills
    .filter((c) => c.billStatus)
    .sort(sortByDateDesc);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skeleton loaders */}
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
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Paid Bills ({paidBills.length})
          </h3>
          {paidBills.length === 0 ? (
            <div className="p-6 text-center bg-green-50 rounded-lg">
              <p>
                No bills paid yet for {selectedMonth}/{selectedYear}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paidBills.map((customer) => (
                <div
                  key={customer._id}
                  className="p-4 border rounded-lg bg-green-50 shadow-sm relative"
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
                  <p>
                    <strong>Method:</strong> {customer.paymentMethod}
                  </p>
                  <p>
                    <strong>Note:</strong> {customer.paymentNote || "-"}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowModal(true);
                    }}
                    className="absolute top-2 right-2 p-1 bg-green-700 text-white rounded hover:bg-green-800"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              ))}
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
              <X size={16} />
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
