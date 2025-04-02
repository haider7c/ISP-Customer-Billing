import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import axios from "axios";
import { fetchSerialNumber, createCustomer } from "../api";

const BASE_URL = "http://localhost:5000";

const Form = ({ initialData = null, onSubmit, onCancel }) => {
  const [serialNumber, setSerialNumber] = useState("");
  const [date, setDate] = useState("");
  const [packages, setPackages] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState("");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const selectedPackageId = watch("packageId");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // For create mode only
        if (!initialData) {
          const storedSerial = localStorage.getItem("serialNumber");
          if (storedSerial) {
            setSerialNumber(storedSerial);
          } else {
            const serial = await fetchSerialNumber();
            setSerialNumber(serial || "");
            localStorage.setItem("serialNumber", serial || "");
          }
        }

        // Date
        const response = await axios.get(`${BASE_URL}/api/date`);
        const fetchedDate = new Date(response.data.date)
          .toISOString()
          .split("T")[0];
        setDate(fetchedDate);
        if (!initialData) setValue("expiryDate", fetchedDate);

        // Packages
        const res = await axios.get(`${BASE_URL}/api/packages`);
        setPackages(res.data);
      } catch (error) {
        console.error("Init error:", error);
        alert("Error initializing form data.");
      }
    };

    fetchInitialData();
  }, [initialData, setValue]);

  useEffect(() => {
    // Auto-fill amount when package selected
    const pkg = packages.find((p) => p._id === selectedPackageId);
    if (pkg) {
      setValue("amount", pkg.defaultAmount);
      setSelectedAmount(pkg.defaultAmount);
    }
  }, [selectedPackageId, packages, setValue]);

  useEffect(() => {
    // Populate form in edit mode
    if (initialData) {
      const cleanData = {
        ...initialData,
        billReceiveDate: initialData.billReceiveDate?.split("T")[0],
        expiryDate: initialData.expiryDate?.split("T")[0],
        billDate: initialData.billDate?.split("T")[0],
        activationDate: initialData.activationDate?.split("T")[0],
      };
      reset(cleanData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    const selectedPkg = packages.find((p) => p._id === data.packageId);
    const payload = {
      ...data,
      billStatus: data.billStatus === "true",
      packageName: selectedPkg?.name || "",
    };

    // Edit mode
    if (initialData && onSubmit) {
      return onSubmit(payload);
    }

    // Create mode
    try {
      const fullPayload = {
        ...payload,
        serialNumber,
        billDate: new Date(),
      };

      await createCustomer(fullPayload);

      // Prepare for next customer
      localStorage.removeItem("serialNumber");
      const newSerial = await fetchSerialNumber();
      setSerialNumber(newSerial || "");
      localStorage.setItem("serialNumber", newSerial || "");

      reset({
        customerName: "",
        phone: "",
        address: "",
        cnic: "",
        packageId: "",
        amount: "",
        billStatus: "false",
        email: "",
        billReceiveDate: "",
        expiryDate: date,
        customerId: "",
      });

      setSelectedAmount("");
      setValue("expiryDate", date);
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? "Edit Customer" : "Create New Order"}
        </h2>
        {!initialData && (
          <span className="text-gray-600">
            Serial #:{" "}
            <span className="text-blue-700 font-semibold">{serialNumber}</span>
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Customer Name</label>
            <input
              {...register("customerName", { required: "Name is required" })}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone is required" }}
              render={({ field }) => (
                <PatternFormat
                  value={field.value}
                  onValueChange={(val) => field.onChange(val.formattedValue)}
                  format="####-#######"
                  mask="_"
                  placeholder="0300-1234567"
                  className="mt-1 p-2 w-full border rounded"
                />
              )}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              {...register("address", { required: "Address is required" })}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Enter address"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">CNIC</label>
            <Controller
              name="cnic"
              control={control}
              rules={{ required: "CNIC is required" }}
              render={({ field }) => (
                <PatternFormat
                  value={field.value}
                  onValueChange={(val) => field.onChange(val.formattedValue)}
                  format="#####-#######-#"
                  mask="_"
                  placeholder="33100-1234567-1"
                  className="mt-1 p-2 w-full border rounded"
                />
              )}
            />
            {errors.cnic && <p className="text-red-500 text-sm">{errors.cnic.message}</p>}
          </div>
        </div>

        {/* MIDDLE */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Package</label>
            <select
              {...register("packageId", {
                required: "Please select a package",
              })}
              className="mt-1 p-2 w-full border rounded"
            >
              <option value="">-- Select Package --</option>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} - Rs {pkg.defaultAmount}
                </option>
              ))}
            </select>
            {errors.packageId && (
              <p className="text-red-500 text-sm">{errors.packageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Bill Amount</label>
            <input
              {...register("amount", { required: "Amount is required" })}
              type="number"
              className="mt-1 p-2 w-full border rounded"
              placeholder="Enter bill amount"
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Bill Status</label>
            <select
              {...register("billStatus", { required: "Select bill status" })}
              className="mt-1 p-2 w-full border rounded"
              defaultValue="false"
            >
              <option value="false">Unpaid</option>
              <option value="true">Paid</option>
            </select>
            {errors.billStatus && (
              <p className="text-red-500 text-sm">{errors.billStatus.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              {...register("email", {
                required: "Email required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
              type="email"
              placeholder="example@mail.com"
              className="mt-1 p-2 w-full border rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Bill Receive Date</label>
            <input
              {...register("billReceiveDate", {
                required: "Bill receive date required",
              })}
              type="date"
              className="mt-1 p-2 w-full border rounded"
            />
            {errors.billReceiveDate && (
              <p className="text-red-500 text-sm">{errors.billReceiveDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Expiry Date</label>
            <input
              {...register("expiryDate", { required: "Expiry date required" })}
              type="date"
              className="mt-1 p-2 w-full border rounded"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Customer ID</label>
            <input
              {...register("customerId", { required: "Customer ID required" })}
              placeholder="Enter ID"
              className="mt-1 p-2 w-full border rounded"
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm">{errors.customerId.message}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="lg:col-span-3 text-center mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {initialData ? "Update" : "Submit"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
