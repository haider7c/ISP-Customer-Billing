import React from "react";
import bg1 from "../../../assets/bg1.png";
import { useNavigate } from "react-router-dom";

const Default = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div
        style={{
          backgroundImage: `url(${bg1})`,
          backgroundSize: "cover", // Adjust this based on how you want the image to behave
          backgroundPosition: "center", // Centers the image
          height: "720px", // Set a height for the div
          width: "100%", // Optional width
        }}
        className="flex flex-col items-center max-h-screen"
      >
        <h1 className="text-white text-5xl font-bold mt-44">
          Effortless Orders
        </h1>
        <h1 className="text-white text-5xl font-bold">Management</h1>
        <p className="text-white mt-5 max-w-xl text-center">
          Add new orders, generate invoices instantly, and simplify your sales operations in one place. Login to Get
          Started.
        </p>
        <button
          className="bg-customGreen text-white rounded-full px-8 cursor-pointer py-2 shadow-lg mt-5"
          onClick={() => navigate("/home")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Default;
