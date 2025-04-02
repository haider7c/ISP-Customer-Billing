import { createSlice } from "@reduxjs/toolkit";

const manualBillSlice = createSlice({
  name: "manualBill",
  initialState: {
    billData: null,
  },
  reducers: {
    saveManualBill: (state, action) => {
      state.billData = action.payload;
    },
  },
});

export const { saveManualBill } = manualBillSlice.actions;
export default manualBillSlice.reducer;