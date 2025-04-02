import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { saveManualBill } from "../Redux/manualBillSlice.js";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ManualBillPDF from "../pages/Templates/ManualBillPDF.jsx";
import axios from "axios"; // ✅ Import axios

const ManualBill = () => {
  const dispatch = useDispatch();
  const [total, setTotal] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      customerName: "",
      date: new Date().toISOString().split("T")[0],
      billAmount: 0,
      months: 1,
      connectionFee: 0,
      additions: [],
      packageName: "",
      totalAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additions",
  });

  const billAmount = watch("billAmount");
  const months = watch("months");
  const connectionFee = watch("connectionFee");
  const additions = useWatch({ control, name: "additions" });

  const calculateTotal = () => {
    const base = billAmount * months;
    const connFee = Number(connectionFee) || 0;
    const additionsSum = additions?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
    const finalTotal = base + connFee + additionsSum;
    setValue("totalAmount", finalTotal);
    setTotal(finalTotal);
  };

  useEffect(() => {
    calculateTotal();
  }, [billAmount, months, connectionFee, additions]);

  // ✅ Updated onSubmit
  const onSubmit = async (data) => {
    dispatch(saveManualBill(data));
    try {
      await axios.post("http://localhost:5000/api/manualBill", data);
      console.log("✅ Bill saved to database.");
    } catch (error) {
      console.error("❌ Failed to save bill:", error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow-md rounded-md border border-gray-200">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">🧾 Manual Bill Generator</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 text-sm">
        {/* LEFT COLUMN */}
        <div className="space-y-2">
          <div>
            <label className="block font-medium mb-1">Customer Name</label>
            <input {...register("customerName", { required: true })} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input type="date" {...register("date")} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Bill Amount</label>
            <input type="number" {...register("billAmount", { valueAsNumber: true })} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Months</label>
            <input type="number" {...register("months", { valueAsNumber: true })} className="border rounded p-2 w-full" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-2">
          <div>
            <label className="block font-medium mb-1">Connection Fee</label>
            <input type="number" {...register("connectionFee", { valueAsNumber: true })} className="border rounded p-2 w-full" />
          </div>

          <div>
            <label className="block font-medium mb-1">Additions</label>
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 mb-1">
                <input placeholder="Title" {...register(`additions.${index}.title`)} className="border rounded p-2 w-full" />
                <input type="number" placeholder="Amount" {...register(`additions.${index}.amount`, { valueAsNumber: true })} className="border rounded p-2 w-24" />
                <button type="button" onClick={() => remove(index)} className="text-red-600 font-bold">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => append({ title: "", amount: 0 })} className="text-blue-600 text-sm">+ Add</button>
          </div>

          <div>
            <label className="block font-medium mb-1">Package Name</label>
            <input {...register("packageName")} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Total</label>
            <input type="number" {...register("totalAmount", { valueAsNumber: true })} className="border rounded p-2 w-full font-semibold text-green-700" />
          </div>
        </div>

        <div className="col-span-2 flex justify-between gap-2 pt-2">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded">Save</button>
          <PDFDownloadLink
            document={<ManualBillPDF billData={watch()} />}
            fileName="manual-bill.pdf"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Print Bill
          </PDFDownloadLink>
        </div>
      </form>
    </div>
  );
};

export default ManualBill;
