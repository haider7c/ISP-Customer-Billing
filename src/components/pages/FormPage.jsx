import React from "react";
import Form from "../Frontcomponents/Form.jsx";
import NavBar from "../Frontcomponents/NavBar.jsx";
import Footer from "../Frontcomponents/Footer.jsx";

const FormPage = () => {
  return (
    <div className="h-screen">
      <NavBar />
      <Form />
      <Footer />
    </div>
  );
};

export default FormPage;
