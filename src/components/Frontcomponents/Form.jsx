import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form"; // ✅ Correct
import { NumericFormat } from "react-number-format";
import { PatternFormat } from "react-number-format";

import axios from "axios";
import { fetchSerialNumber, createCustomer } from "../api";

const BASE_URL = "http://localhost:5000"; // Update if different

const Form = () => {
  const [serialNumber, setSerialNumber] = useState("");
  const [date, setDate] = useState("");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchSerialAndDate = async () => {
      try {
        // SERIAL NUMBER: Check localStorage first
        const storedSerial = localStorage.getItem("serialNumber");
        if (storedSerial) {
          setSerialNumber(storedSerial);
        } else {
          const serial = await fetchSerialNumber();
          setSerialNumber(serial || "");
          localStorage.setItem("serialNumber", serial || "");
        }

        // DATE: Fetch current server date
        const response = await axios.get(`${BASE_URL}/api/date`);
        const fetchedDate = response.data.date;
        const formattedDate = new Date(fetchedDate).toISOString().split("T")[0];
        setDate(formattedDate);
        setValue("expiryDate", formattedDate); // set default for expiry date if needed
      } catch (error) {
        console.error("Error fetching serial number or date:", error);
        alert("Error fetching serial number or date.");
      }
    };

    fetchSerialAndDate();
  }, [setValue]);

  // SUBMIT
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, serialNumber };
      const response = await createCustomer(payload);
      console.log("Invoice created:", response);
      alert("Invoice submitted successfully!");
      reset();
      localStorage.removeItem("serialNumber");

      // Fetch a fresh serial number for the next entry
      const newSerial = await fetchSerialNumber();
      setSerialNumber(newSerial || "");
      localStorage.setItem("serialNumber", newSerial || "");
    } catch (error) {
      alert("Error submitting invoice. Check console for details.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
        <h2 className="text-xl font-semibold mb-6 mx-5 text-gray-700">
          Serial#: <span className="text-blue-700">{serialNumber}</span>
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* Customer Name Input */}
          <div>
            <label className="block text-sm font-medium">Customer Name</label>
            <input
              {...register("customerName", {
                required: "Customer Name is required",
              })}
              type="text"
              placeholder="Enter customer name"
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm">
                {errors.customerName.message}
              </p>
            )}
          </div>

          {/* Phone Number Input with Formatting */}
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <PatternFormat
                  {...field}
                  format="####-#######"
                  allowEmptyFormatting
                  mask="_"
                  placeholder="0304-1234567"
                  className="mt-1 p-2 w-full border rounded-md"
                  onValueChange={(val) => field.onChange(val.formattedValue)}
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Address Input */}
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              {...register("address", { required: "Address is required" })}
              type="text"
              placeholder="Enter address"
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* CNIC Input with Formatting */}
          <div>
            <label className="block text-sm font-medium">CNIC</label>
            <Controller
              name="cnic"
              control={control}
              rules={{ required: "CNIC is required" }}
              render={({ field }) => (
                <PatternFormat
                  {...field}
                  format="#####-#######-#"
                  allowEmptyFormatting
                  mask="_"
                  placeholder="33100-1234567-1"
                  className="mt-1 p-2 w-full border rounded-md"
                  onValueChange={(val) => field.onChange(val.formattedValue)}
                />
              )}
            />
            {errors.cnic && (
              <p className="text-red-500 text-sm">{errors.cnic.message}</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Expiry Date</label>
            <input
              {...register("expiryDate", {
                required: "Expiry date is required",
              })}
              type="date"
              defaultValue={date}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm">
                {errors.expiryDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Bill Reveive Date
            </label>
            <input
              {...register("receivingDate", {
                required: "Receiving date is required",
              })}
              type="date"
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.receivingDate && (
              <p className="text-red-500 text-sm">
                {errors.receivingDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Customer ID</label>
            <input
              {...register("customerId", {
                required: "Customer ID is required",
              })}
              type="text"
              placeholder="Enter Customer ID"
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="example@example.com"
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Bill Status</label>
            <select
              {...register("billStatus", {
                required: "Please select bill status",
              })}
              className="mt-1 p-2 w-full border rounded-md"
              defaultValue="false"
            >
              <option value="false">Unpaid</option>
              <option value="true">Paid</option>
            </select>
            {errors.billStatus && (
              <p className="text-red-500 text-sm">
                {errors.billStatus.message}
              </p>
            )}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 w-full"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
