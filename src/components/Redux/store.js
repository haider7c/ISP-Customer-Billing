import { configureStore } from "@reduxjs/toolkit";
import invoiceReducer from "./invoiceReducer";

export const store = configureStore({
  reducer: {
    Invoice: invoiceReducer,
  },
});
