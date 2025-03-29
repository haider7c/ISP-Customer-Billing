import React from "react";
import { FcGoogle } from "react-icons/fc";
import NavBar from "../Frontcomponents/NavBar.jsx";
import Footer from "../Frontcomponents/Footer.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center mx-5 p-5">
        {/* <img
          src="https://cdn.invoice-generator.com/img/logo.1457551a.svg"
          alt=""
          width={400}
          className="my-10"
        /> */}
        <div className="shadow-lg px-5 py-7 rounded-lg lg:w-2/5 w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-semibold">Sign In</h1>
            <p className="text-gray-600">Welcome back!</p>
          </div>
          <form action="" className="w-full">
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="my-2">
                Email
              </label>
              <input type="text" className="py-2 border-2 rounded-md px-2" />
            </div>
            <div className="flex flex-col ">
              <div className="my-2 flex justify-between">
                <label htmlFor="">Password</label>
                <button className="text-gray-500">Forgot password?</button>
              </div>
              <input type="text" className="py-2 border-2 rounded-md px-2" />
            </div>
            <button
              className="bg-[#20ad77] w-full text-white py-3 rounded-md mt-10"
              onClick={() => navigate("/home")}
            >
              Sign In
            </button>
          </form>
          {/* <div className="flex items-center mt-5 gap-2 px-5 py-2 rounded-md border-2 hover:cursor-pointer">
            <FcGoogle size={30} />
            <p>Sign in with Google</p>
          </div> */}
          {/* <div className="flex mt-5 items-center gap-1">
            <p>Don't have an account yet?</p>
            <button
              className="text-green-800"
              // onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div> */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
