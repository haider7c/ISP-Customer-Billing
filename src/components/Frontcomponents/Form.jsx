import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import axios from "axios";
import { fetchSerialNumber, createCustomer } from "../api";

const BASE_URL = "http://localhost:5000";

const Form = ({ initialData = null, onSubmit, onCancel, isSubmitting = false }) => {
  const [serialNumber, setSerialNumber] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [packages, setPackages] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [loading, setLoading] = useState(true);

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

        // Get current day of month (1-31)
        const today = new Date();
        const dayOfMonth = today.getDate();
        setCurrentDay(dayOfMonth);
        
        // Set billReceiveDate to current day (single digit)
        if (!initialData) {
          setValue("billReceiveDate", dayOfMonth.toString());
          setValue("regDate", today.toISOString().split("T")[0]);
        }

        // Packages
        const res = await axios.get(`${BASE_URL}/api/packages`);
        setPackages(res.data);
      } catch (error) {
        console.error("Init error:", error);
        alert("Error initializing form data.");
      } finally {
        setLoading(false);
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
    // Populate form in edit mode - FIXED for billReceiveDate
    if (initialData) {
      // Convert billReceiveDate from timestamp back to day number
      let billReceiveDay = initialData.billReceiveDate;
      
      // If it's a timestamp, extract the day
      if (initialData.billReceiveDate && typeof initialData.billReceiveDate === 'string' && initialData.billReceiveDate.includes('T')) {
        const date = new Date(initialData.billReceiveDate);
        billReceiveDay = date.getDate().toString();
      } else if (typeof initialData.billReceiveDate === 'number') {
        // If it's stored as milliseconds, convert to day
        const date = new Date(initialData.billReceiveDate);
        billReceiveDay = date.getDate().toString();
      }
      
      const cleanData = {
        ...initialData,
        billReceiveDate: billReceiveDay,
        regDate: initialData.regDate?.split("T")[0],
        billDate: initialData.billDate?.split("T")[0],
        activationDate: initialData.activationDate?.split("T")[0],
      };
      reset(cleanData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    const selectedPkg = packages.find((p) => p._id === data.packageId);
    
    // Convert billReceiveDate to number and ensure it's between 1-31
    const billDay = Math.max(1, Math.min(31, parseInt(data.billReceiveDate) || currentDay));
    
    const payload = {
      ...data,
      billStatus: data.billStatus === "true",
      packageName: selectedPkg?.name || "",
      // Store as simple number, not Date object
      billReceiveDate: billDay,
      amount: selectedPkg?.defaultAmount || data.amount,
    };

    // Remove any Date objects that might be created
    delete payload.billDate;
    delete payload.regDate;

    // Edit mode
    if (initialData && onSubmit) {
      return onSubmit(payload);
    }

    // Create mode
    try {
      const fullPayload = {
        ...payload,
        serialNumber,
        // Add dates as ISO strings separately
        billDate: new Date().toISOString(),
        regDate: new Date(data.regDate).toISOString(),
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
        email: "",
        billReceiveDate: currentDay.toString(), // Reset to current day
        regDate: new Date().toISOString().split("T")[0],
        customerId: "",
      });

      setSelectedAmount("");
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-gray-500">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? "✏️ Edit Customer" : "➕ Create New Order"}
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
            <label className="block text-sm font-medium mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("customerName", { required: "Name is required" })}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Enter customer name"
              disabled={isSubmitting}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
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
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("address", { required: "Address is required" })}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Enter address"
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* MIDDLE */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Package <span className="text-red-500">*</span>
            </label>
            <select
              {...register("packageId", {
                required: "Please select a package",
              })}
              className="mt-1 p-2 w-full border rounded"
              disabled={isSubmitting}
            >
              <option value="">-- Select Package --</option>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} - Rs {pkg.defaultAmount}
                </option>
              ))}
            </select>
            {errors.packageId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packageId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
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
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              CNIC <span className="text-red-500">*</span>
            </label>
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
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.cnic && (
              <p className="text-red-500 text-sm mt-1">{errors.cnic.message}</p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bill Day (1-31) <span className="text-red-500">*</span>
            </label>
            <input
              {...register("billReceiveDate", { 
                required: "Bill day is required",
                min: { value: 1, message: "Minimum day is 1" },
                max: { value: 31, message: "Maximum day is 31" },
                pattern: {
                  value: /^(3[0-1]|[12][0-9]|[1-9])$/,
                  message: "Enter a valid day (1-31)"
                }
              })}
              type="number"
              min="1"
              max="31"
              placeholder={`e.g., ${currentDay}`}
              className="mt-1 p-2 w-full border rounded"
              disabled={isSubmitting}
            />
            {errors.billReceiveDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billReceiveDate.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Day of month when bill should be received (1-31)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Registration Date <span className="text-red-500">*</span>
            </label>
            <input
              {...register("regDate", { required: "Register date required" })}
              type="date"
              className="mt-1 p-2 w-full border rounded"
              disabled={isSubmitting}
            />
            {errors.regDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.regDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer ID <span className="text-red-500">*</span>
            </label>
            <input
              {...register("customerId", { required: "Customer ID required" })}
              placeholder="Enter ID"
              className="mt-1 p-2 w-full border rounded"
              disabled={isSubmitting}
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerId.message}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="lg:col-span-3 text-center mt-6 flex justify-center gap-4">
          <button
            type="submit"
            className={`bg-blue-600 text-white px-6 py-2 rounded flex items-center justify-center min-w-[100px] ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {initialData ? "Updating..." : "Submitting..."}
              </>
            ) : initialData ? "Update" : "Submit"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
              disabled={isSubmitting}
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