import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./components/Redux/store.js";
import Form from "./components/Frontcomponents/Form.jsx";
import Login from "./components/pages/Login.jsx";
import App from "./components/App.js";
import Home from "./components/pages/Home.jsx";
import CustomerList from "./components/Frontcomponents/CustomerList.jsx";
import OrdersPage from "./components/pages/OrdersPage.jsx";
import "./App.css";
import FormPage from "./components/pages/FormPage.jsx";
import NavBar from "./components/Frontcomponents/NavBar.jsx";
import Footer from "./components/Frontcomponents/Footer.jsx";

// Ensure a root element exists in the DOM
let rootElement = document.getElementById("root");
if (!rootElement) {
  rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
}

// Render the React app
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Provider store={store}>
      <Router>
      <NavBar/>
        <Routes>
          
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/form" element={<Form />} />
          <Route path="/customerlist" element={<CustomerList />} />
          <Route path="/orderspage" element={<OrdersPage />} />
          <Route path="/formpage" element={<FormPage />} />
        
        </Routes>
        <Footer />
      </Router>
    </Provider>
  </StrictMode>
);
