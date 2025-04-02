// ManualBillViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ManualBillPDF from "../pages/Templates/ManualBillPDF.jsx";
import { PDFViewer } from "@react-pdf/renderer";

const ManualBillViewer = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/manualBill");
        setBills(res.data);
        if (res.data.length > 0) {
          setSelectedBill(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load manual bills", err);
      }
    };

    fetchBills();
  }, []);

  return (
    <div className="flex h-[80vh] max-w-7xl mx-auto border rounded overflow-hidden shadow">
      {/* Left side list */}
      <div className="w-1/3 overflow-y-auto border-r p-4 bg-gray-50">
        <h2 className="text-lg font-bold mb-2">📑 Saved Manual Bills</h2>
        <ul className="space-y-2">
          {bills.map((bill, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedBill(bill)}
              className={`p-2 border rounded cursor-pointer hover:bg-blue-100 ${
                selectedBill?._id === bill._id ? "bg-blue-200" : ""
              }`}
            >
              <p className="font-medium">{bill.customerName}</p>
              <p className="text-xs text-gray-600">Date: {bill.date}</p>
              <p className="text-xs text-gray-600">Total: Rs {bill.totalAmount}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side viewer */}
      <div className="w-2/3 p-4">
        {selectedBill ? (
          <div className="h-full w-full">
            <PDFViewer width="100%" height="100%" className="border rounded">
              <ManualBillPDF billData={selectedBill} />
            </PDFViewer>
          </div>
        ) : (
          <p className="text-gray-500 italic">Select a bill from the list to view.</p>
        )}
      </div>
    </div>
  );
};

export default ManualBillViewer;
