import { configureStore } from "@reduxjs/toolkit";
import manualBillReducer from "./manualBillSlice";

export const store = configureStore({
  reducer: {
    manualBill: manualBillReducer,
  },
});
