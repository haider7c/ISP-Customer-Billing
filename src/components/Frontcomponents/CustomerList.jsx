import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchcustomers, updateCustomer } from '../api';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import ReceiptPDF from '../pages/Templates/ReceiptPDF.jsx';
import { X, Printer } from 'lucide-react';

const CustomerList = () => {
  const [customerData, setCustomerData] = useState([]);
  const [searchField, setSearchField] = useState('customerId');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

  const sortByReceiveDateDesc = (a, b) => new Date(b.billReceiveDate) - new Date(a.billReceiveDate);

  const filteredData = customerData.filter((c) => {
    const value = (c[searchField] || '').toString().toLowerCase();
    return value.includes(searchQuery.toLowerCase());
  });

  const unpaidBills = filteredData.filter((c) => c.billStatus === false).sort(sortByReceiveDateDesc);
  const paidBills = filteredData.filter((c) => c.billStatus === true).sort(sortByReceiveDateDesc);

  const markAsPaid = async (id, method, note) => {
    try {
      await updateCustomer(id, {
        billStatus: true,
        paymentMethod: method,
        paymentNote: note,
      });
      setCustomerData((prev) =>
        prev.map((c) => (c._id === id ? { ...c, billStatus: true, paymentMethod: method, paymentNote: note } : c))
      );
    } catch (err) {
      console.error('Failed to mark bill as received:', err);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setCustomerData((prev) => [...json, ...prev]);
      alert(`✅ Imported ${json.length} customers from Excel!`);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(customerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'customer_records.xlsx');
  };

  const handlePrint = async () => {
    const blob = await pdf(<ReceiptPDF customer={selectedCustomer} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    win.print();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📄 Customer Bills</h2>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <select
          className="border rounded p-2"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="customerId">Search by Customer ID</option>
          <option value="customerName">Search by Name</option>
          <option value="cnic">Search by CNIC</option>
        </select>
        <input
          type="text"
          className="border rounded p-2 w-full md:w-1/3"
          placeholder={`Search by ${searchField}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-red-700 mb-3">Unpaid Bills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {unpaidBills.map((item) => (
              <div key={item._id} className="p-4 border rounded-lg bg-red-50 shadow-sm">
                <p><strong>Name:</strong> {item.customerName}</p>
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>Customer ID:</strong> {item.customerId}</p>
                <p><strong>CNIC:</strong> {item.cnic}</p>
                <p><strong>Package:</strong> {item.packageName || 'N/A'}</p>
                <p><strong>Bill Date:</strong> {item.billReceiveDate?.split('T')[0]}</p>
                <div className="mt-3 space-y-2">
                  <select
                    value={item.paymentMethod || ''}
                    onChange={(e) => {
                      const method = e.target.value;
                      setCustomerData((prev) =>
                        prev.map((c) => (c._id === item._id ? { ...c, paymentMethod: method } : c))
                      );
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">-- Select Payment Method --</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Payment description..."
                    value={item.paymentNote || ''}
                    onChange={(e) => {
                      const note = e.target.value;
                      setCustomerData((prev) =>
                        prev.map((c) => (c._id === item._id ? { ...c, paymentNote: note } : c))
                      );
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => markAsPaid(item._id, item.paymentMethod, item.paymentNote)}
                    disabled={!item.paymentMethod}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 w-full disabled:bg-gray-400"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-3">Paid Bills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paidBills.map((item) => (
              <div key={item._id} className="p-4 border rounded-lg bg-green-50 shadow-sm relative">
                <p><strong>Name:</strong> {item.customerName}</p>
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>Customer ID:</strong> {item.customerId}</p>
                <p><strong>CNIC:</strong> {item.cnic}</p>
                <p><strong>Package:</strong> {item.packageName || 'N/A'}</p>
                <p><strong>Bill Date:</strong> {item.billReceiveDate?.split('T')[0]}</p>
                <p><strong>Method:</strong> {item.paymentMethod || 'N/A'}</p>
                <p><strong>Note:</strong> {item.paymentNote || '-'}</p>
                <button
                  onClick={() => {
                    setSelectedCustomer(item);
                    setShowModal(true);
                  }}
                  className="absolute top-2 right-2 p-1 bg-green-700 text-white rounded hover:bg-green-800"
                >
                  <Printer size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="border p-2" />
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded">
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default CustomerList;