import axios from "axios";

// Function to send form data to the backend
export const createCustomer = async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/customers",
      formData
    );
    return response.data; // Return the created invoice data
  } catch (error) {
    console.error("Error creating Customer:", error);
    throw error; // Propagate the error for handling in the frontend
  }
};

// Function to fetch all customers
export const fetchcustomers = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/customers");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};
export const saveFormData = async (formValues) => {
  try {
    console.log("FormValues being sent:", formValues); // Log payload
    const response = await axios.post(
      "http://localhost:5000/api/customers",
      formValues
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error saving form data:",
      error.response?.data || error.message
    ); // Log detailed error
    throw error;
  }
};

// Function to fetch a serial number
export const fetchSerialNumber = async () => {
  try {
    console.log("Fetching serial number...");
    const response = await fetch(
      "http://localhost:5000/api/serialNumber/getSerialNumber",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.serialNumber;
  } catch (error) {
    console.error("Error fetching serial number:", error);
    return null;
  }
};

// Function to update an invoice
export const updateCustomer = async (customerId, updatedData) => {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/customers/${customerId}`,
      updatedData
    );
    return response.data; // Return the updated invoice data
  } catch (error) {
    console.error("Error updating Customer:", error);
    throw error;
  }
};

// Function to delete an invoice
export const deleteCustomer = async (customerId) => {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/customers/${customerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Customer:", error);
    throw error;
  }
};
