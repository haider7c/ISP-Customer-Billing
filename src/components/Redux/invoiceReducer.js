import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Async Thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5000/api/invoices");
      return response.data;
    } catch (err) {
      console.error("Error fetching invoices:", err);
      return rejectWithValue(err.message);
    }
  }
);

const savedFormDetails = {
  items: [
    {
      description: "",
      riceRate: "",
      safiWeight: "0",
      emptyBag: "0",
      quantity: "1",
      weightBag: "0",
      kgWeight: "0",
    },
  ],
  notes: "",
  terms: "",
  vehicleReg: "",
  transpExp: "",
  amountPaid: "",
  subtotal: "",
  total: "",
  balanceDue: "",
  serialNumb: "",
  billTo: "",
  phone: "",
  date: "",
  bardanaList: [
    {
      bardanaDesc: "",
      bardanaQty: "",
      addBardana: "",
      totalBardana: "",
    },
  ],
  slaeList: [
    {
      slaeDesc: "",
      slaeQty: "",
      labourCost: "",
      totalSlae: "",
    },
  ],
  prevDue: "",
  prevDueAction: "",
  transpAction: "",
  brokery: "",
  brokValue: "",
  brokAddSub: "",
};

const invoiceFormSlice = createSlice({
  name: "invoiceForm",
  initialState: {
    formDetails: savedFormDetails,
    invoices: [],
    error: null,
    isLoading: false, // New loading flag
  },
  reducers: {
    addFormData(state, action) {
      state.formDetails = action.payload;
      localStorage.setItem("formDetails", JSON.stringify(action.payload));
    },
    updateBardanaList(state, action) {
      state.formDetails.bardanaList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error("Failed to fetch invoices. Please try again.");
      });
  },
});

export const { addFormData, updateBardanaList } = invoiceFormSlice.actions;
export default invoiceFormSlice.reducer;
