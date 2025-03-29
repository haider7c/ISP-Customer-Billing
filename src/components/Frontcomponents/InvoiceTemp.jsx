import React from "react";
import logo from "../../../assets/logo.png";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Template2 from "../pages/Templates/Template2.jsx";

const InvoiceTemp = ({ invoiceData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-1/2">
      {/* <div>
        <PDFDownloadLink
          document={<Template2 data={invoiceData} />}
          fileName={invoiceData.billTo || "invoice.pdf"} // Use a default file name
          className="px-10 py-3 bg-customGreen text-white rounded-md w-60 text-center"
        >
          {({ blob, url, loading, error }) =>
            loading ? "Loading document..." : "Download PDF!"
          }
        </PDFDownloadLink>
      </div> */}
      <div className="p-8 bg-white border rounded shadow-md font-sans ">
        {/* Header Section */}
        <div className="border-b pb-6">
          <div className="flex justify-between items-center">
            <img src={logo} alt="Logo" className="h-26 w-40" />
            <div className="text-right">
              <h1 className="text-2xl font-bold tracking-wide">INVOICE</h1>
              <div className="text-sm">
                <div className="flex justify-between w-40 mt-2">
                  <span className="font-semibold">Invoice #:</span>
                  <span>{invoiceData.serialNumb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Date:</span>
                  <span>{formatDate(invoiceData.date)}</span>
                </div>
                {invoiceData.vehicleReg && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Vehicle #:</span>
                    <span>{invoiceData.vehicleReg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm">Invoice to:</p>
            <p className="font-bold text-lg">{invoiceData.billTo}</p>
            <p className="text-sm">Phone:</p>
            <p className="font-bold text-lg">{invoiceData.phone}</p>
          </div>
        </div>

        {/* Items Section */}
        <div className="mt-6 border-t border-b py-4">
          <h2 className="font-semibold mb-4">Items:</h2>
          {invoiceData.items.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="grid grid-cols-2">
                <span className="font-semibold">Description:</span>
                <span className="text-right">{item.description}</span>
              </div>
              {item.quantity && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Quantity:</span>
                  <span className="text-right">{item.quantity} Bag</span>
                </div>
              )}
              {item.weight && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Bharti:</span>
                  <span className="text-right">{item.weight} kg</span>
                </div>
              )}
              {item.kgWeight && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Weight:</span>
                  <span className="text-right">{item.kgWeight} kg</span>
                </div>
              )}
              {item.emptyBag && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Khali Kat:</span>
                  <span className="text-right">{item.emptyBag} kg</span>
                </div>
              )}
              {item.safiWeight && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Safi Weight:</span>
                  <span className="text-right">
                    {invoiceData.safiWeight} kg
                  </span>
                </div>
              )}
              {item.riceRate && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Rate:</span>
                  <span className="text-right">
                    {item.riceRate} / {item.unit} kg
                  </span>
                </div>
              )}
              {item.riceRate && (
                <div className="grid grid-cols-2 mt-2">
                  <span className="font-semibold">Item Amount:</span>
                  <span className="text-right">
                    {((item.safiWeight / item.unit) * item.riceRate).toFixed(2)}{" "}
                    Rs
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bardana Section */}
        {invoiceData.bardanaList.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold">Bardana List:</h2>
            <ul className="list-disc pl-5">
              {invoiceData.bardanaList.map((bardana, index) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">QTY:</span>{" "}
                  {bardana.bardanaQty},
                  <span className="font-semibold ml-2">Rate:</span>{" "}
                  {bardana.addBardana},
                  <span className="font-semibold ml-2">Total:</span>{" "}
                  {bardana.totalBardana}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Calculations */}
        <div className="mt-4">
          {invoiceData.slaeList.length > 0 ? (
            <div className="mt-6 border-t pt-4">
              <h2 className="font-semibold">Sale List:</h2>
              <ul className="list-disc pl-5">
                {invoiceData.slaeList.map((sale, index) => (
                  <li key={index} className="mb-2">
                    {sale.slaeDesc && (
                      <div className="grid grid-cols-2">
                        <span className="font-semibold">Description:</span>
                        <span className="text-right">{sale.slaeDesc}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 mt-2">
                      <span className="font-semibold">Quantity:</span>
                      <span className="text-right">{sale.slaeQty}</span>
                    </div>
                    <div className="grid grid-cols-2 mt-2">
                      <span className="font-semibold">Labour Cost:</span>
                      <span className="text-right">{sale.labourCost} Rs</span>
                    </div>
                    <div className="grid grid-cols-2 mt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="text-right">{sale.totalSlae} Rs</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div></div>
          )}

          {invoiceData.brokValue && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Brokery:</span>
              <span className="text-right">
                {invoiceData.brokAddSub} {invoiceData.brokValue} Rs
              </span>
            </div>
          )}
          {invoiceData.labourPerBag && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Labour:</span>
              <span className="text-right">
                {invoiceData.labourPerBag} * {invoiceData.slaeQty} =
                {invoiceData.labourPerBag * invoiceData.slaeQty} Rs
              </span>
            </div>
          )}
          {invoiceData.transpExp && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Transportation:</span>
              <span className="text-right">{invoiceData.transpExp} Rs</span>
            </div>
          )}
          {invoiceData.prevDue && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Previous Dues:</span>
              <span className="text-right">
                {invoiceData.prevDueAction || ""} {invoiceData.prevDue} Rs
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 mt-4 border-t pt-2">
            <span className="font-semibold">Total:</span>
            <span className="text-right">{invoiceData.total} Rs</span>
          </div>
          {invoiceData.amountPaid && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Amount Paid:</span>
              <span className="text-right">{invoiceData.amountPaid} Rs</span>
            </div>
          )}
          {invoiceData.balanceDue && (
            <div className="grid grid-cols-2 mt-2">
              <span className="font-semibold">Balance Due:</span>
              <span className="text-right">{invoiceData.balanceDue} Rs</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-4 text-sm text-gray-600">
          <p>Phone: 03157484638</p>
          <p>Address: Chabba Road, Faisalabad</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemp;
