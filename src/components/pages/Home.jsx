import React from "react";
import { useAsyncError, useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "../Frontcomponents/Footer.jsx";
import NavBar from "../Frontcomponents/NavBar.jsx";
import bg2 from "../../../assets/bg1.png";
import card1 from "../../../assets/card1.png";
import card2 from "../../../assets/card2.png";
import Form from "../Frontcomponents/Form.jsx";
const Home = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
     
       {/* FORM MODAL */}
       {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 relative w-[90%] max-w-xl">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-2xl font-bold text-gray-600 hover:text-black"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <Form />
          </div>
        </div>
      )}

      <div
        style={{
          backgroundImage: `url(${bg2})`,
          backgroundSize: "cover", // Adjust this based on how you want the image to behave
          // backgroundPosition: "center", // Centers the image
          height: "720px", // Set a height for the div
          width: "100%", // Optional width
        }}
        className="bg-cover h-screen flex flex-col items-center text-center"
      >
        <div className="my-5">
          <h1 className="text-white text-5xl font-bold">
            Streamline Your Business
          </h1>
          <h1 className="text-white text-5xl font-bold">Orders With Ease</h1>
        </div>
        <div className="flex gap-10">
          <div
            style={{
              backgroundImage: `url(${card1})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            className="hover:cursor-pointer"
            // onClick={() => navigate("/formpage")}
            onClick={() => setShowForm(true)} // ✅ FIX: wrap in a function
            
          >
            
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                Create New Customer
              </h1>
              <p className="mt-5 text-sm text-white">
                Start a new customer instantly
              </p>
            </div>
          </div>
          {/* Button 1  */}
          <div
            style={{
              backgroundImage: `url(${card2})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            className="hover:cursor-pointer"
            onClick={() => navigate("/customerlist")}
          >
            {" "}
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                Manage Billing
              </h1>
              <p className="mt-12 text-sm">Get the details of added customers</p>
            </div>
          </div>
          {/* Button 2  */}
          <div
            style={{
              backgroundImage: `url(${card2})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            className="hover:cursor-pointer"
            onClick={() => navigate("/manage")}
          >
            {" "}
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                View & Update All Customers
              </h1>
              <p className="mt-5 text-sm">Manage all Orders edit</p>
            </div>
          </div>
          {/* button 3  */}
        </div>
        {/* A Complete Row for Buttons  */}
        <div className="flex gap-10 mt-10">
          <div
            style={{
              backgroundImage: `url(${card2})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            onClick={()=>{navigate("/packagemanager")}}
            className="hover:cursor-pointer"
          >
            {" "}
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                Manage Packages
              </h1>
              <p className="mt-12 text-sm">Manage all packages edit</p>
            </div>
          </div>
          {/* Button 1  */}
          <div
            style={{
              backgroundImage: `url(${card2})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            onClick={()=>{navigate("/manualBill")}}
            className="hover:cursor-pointer"
          >
            {" "}
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                Manually Generate BIll
              </h1>
              <p className="mt-5 text-sm">Generate & Print Bill</p>
            </div>
          </div>
          {/* Button 2  */}
          <div
            style={{
              backgroundImage: `url(${card2})`,
              backgroundSize: "cover", // Adjust this based on how you want the image to behave
              // backgroundPosition: "center", // Centers the image
              height: "250px", // Set a height for the div
              width: "250px", // Optional width
            }}
            className="hover:cursor-pointer"
            onClick={()=>{navigate("/manualBillView")}}

          >
            {" "}
            <div className="flex flex-col items-start ml-5 mt-5">
              <div className="bg-white px-2 py-1 rounded-sm shadow-md">+</div>
              <h1 className="text-2xl max-w-32 text-left font-bold mt-8">
                View All Saved Bills
              </h1>
              <p className="mt-12 text-sm">View All Bills</p>
            </div>
          </div>
          {/* button 3  */}
        </div>
        {/* 2nd Row of Buttons  */}
      </div>
    
    </div>
  );
};

export default Home;
