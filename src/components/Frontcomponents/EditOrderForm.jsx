import React, { useState } from "react";

const EditOrderForm = ({ order, onCancel, onSave }) => {
  // Create a deep copy of `order` to avoid modifying the original object
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(order)));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, arrayName, index, key) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedArray = [...prev[arrayName]]; // Shallow copy the array
      updatedArray[index] = { ...updatedArray[index], [key]: value }; // Update specific item
      return { ...prev, [arrayName]: updatedArray }; // Update state
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-md max-w-3xl w-full overflow-auto max-h-[90vh]">
        <h2 className="text-lg font-bold mb-4">Edit Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Customer:</label>
              <input
                type="text"
                name="billTo"
                value={formData.billTo}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Invoice ID:</label>
              <input
                type="text"
                name="serialNumb"
                value={formData.serialNumb}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Vehicle Registration:</label>
              <input
                type="text"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Total:</label>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Amount Paid:</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <label>Balance Due:</label>
              <input
                type="number"
                name="balanceDue"
                value={formData.balanceDue}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <h3>Items:</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="mb-4 flex flex-wrap">
                <div className="flex flex-col">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "description")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "quantity")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Bharti:</label>
                  <input
                    type="number"
                    value={item.weight || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "weight")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Weight:</label>
                  <input
                    type="number"
                    value={item.kgWeight || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "kgWeight")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Kaat:</label>
                  <input
                    type="number"
                    value={item.emptyBag || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "emptyBag")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Safi Weight:</label>
                  <input
                    type="number"
                    value={item.safiWeight || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "safiWeight")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Rate:</label>
                  <input
                    type="number"
                    value={item.riceRate || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "riceRate")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Unit:</label>
                  <input
                    type="number"
                    value={item.unit || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "items", index, "unit")
                    }
                    className="w-full border px-1 py-1 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bardana List */}
          <div>
            <h3>Bardana List:</h3>
            {formData.bardanaList.map((bardana, index) => (
              <div key={index} className="mb-4 flex flex-wrap flex-row">
                <div className="flex flex-col">
                  <label>QTY:</label>
                  <input
                    type="number"
                    value={bardana.bardanaQty || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "bardanaList", index, "bardanaQty")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Rate:</label>
                  <input
                    type="number"
                    value={bardana.addBardana || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "bardanaList", index, "addBardana")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Total:</label>
                  <input
                    type="number"
                    value={bardana.totalBardana || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "bardanaList", index, "totalBardana")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sale List */}
          <div>
            <h3>Sale List:</h3>
            {formData.slaeList.map((sale, index) => (
              <div key={index} className="mb-4 flex flex-wrap flex-row">
                <div className="flex flex-col">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={sale.slaeDesc || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "slaeList", index, "slaeDesc")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={sale.slaeQty || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "slaeList", index, "slaeQty")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Labour Cost:</label>
                  <input
                    type="number"
                    value={sale.labourCost || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "slaeList", index, "labourCost")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Total:</label>
                  <input
                    type="number"
                    value={sale.totalSlae || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "slaeList", index, "totalSlae")
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderForm;
