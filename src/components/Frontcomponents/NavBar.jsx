import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      name: "Home",
      link: "/home",
    },
    // {
    //   name: "Help",
    //   // link: "/help",
    // },
    // {
    //   name: "History",
    //   // link: "/history",
    // },
    // {
    //   name: "Invoicing Guide",
    //   // link: "/invoicingguide  ",
    // },
  ];

  const [menu, setMenu] = useState(false);

  return (
    <div className="relative">
      <div className="flex flex-row justify-between pr-8 pl-8 items-center pt-3 pb-3 shadow-sm ">
        <div className="flex flex-row gap-14 items-center">
          <img
            src={logo}
            alt=""
            width={200}
            className="hover:cursor-pointer h-16"
            onClick={() => navigate("/")}
          />
          <div className="hidden lg:flex flex-row gap-10 ">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="hover:cursor-pointer text-gray-600 hover:text-green-600"
                onClick={() => navigate(item.link)} // Wrap navigate in an arrow function
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* <div className="hidden lg:flex flex-row gap-10">
          <button onClick={() => navigate("/login")}>Sign In</button>
          <button
            className="bg-[#20b27a] py-2 px-3 rounded-lg text-white"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default NavBar;
