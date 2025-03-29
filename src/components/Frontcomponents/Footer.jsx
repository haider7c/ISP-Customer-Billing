import React from "react";
import { FaRegCopyright } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";

const Footer = () => {
  return (
    <div className="flex md:flex-row flex-col md:justify-between gap-5 mx-10 border-t-2 py-10">
      <div>
        <h1 className="text-md font-semibold ">USE INVOICE GENERATOR</h1>
        <ul className="flex flex-col gap-1">
          <li className="hover:cursor-pointer hover:text-green-600">
            Invoice Template
          </li>
          <li className="hover:cursor-pointer hover:text-green-600">
            Credit Note Template
          </li>
          <li className="hover:cursor-pointer hover:text-green-600">
            Quote Template
          </li>
          <li className="hover:cursor-pointer hover:text-green-600">
            Purchase Order Template
          </li>
        </ul>
      </div>
      {/* 1st Coloumn */}
      <div>
        <h1 className="text-md font-semibold">RESOURCES</h1>
        <ul className="flex flex-col gap-1">
          <li className="hover:cursor-pointer hover:text-green-600">
            Invoicing Guide
          </li>
          <li className="hover:cursor-pointer hover:text-green-600">Help</li>
          <li className="hover:cursor-pointer hover:text-green-600">Sign In</li>
          <li className="hover:cursor-pointer hover:text-green-600">Sign Up</li>
          <li className="hover:cursor-pointer hover:text-green-600">
            Release Notes
          </li>
          <li className="hover:cursor-pointer hover:text-green-600">
            Developer API
          </li>
        </ul>
      </div>
      {/* 2nd Coloumn  */}
      <div className="lg:mr-44">
        <p className="flex items-center gap-1 text-gray-600">
          <FaRegCopyright />
          <span>2012 - 2024 Invoice-Generator.com</span>
        </p>
        <div className="flex lg:flex-row gap-2 my-3">
          <FaFacebookSquare size={30} />
          <FaSquareXTwitter size={30} />
          <FaYoutube size={30} />
          <FaLinkedin size={30} />
          <IoLogoGithub size={30} />
        </div>
        <ul>
          <li className="hover:cursor-pointer hover:text-green-600 text-gray-600">
            Terms of Service
          </li>
          <li className="hover:cursor-pointer hover:text-green-600 text-gray-600">
            Privacy Policy
          </li>
        </ul>
      </div>
      {/* 3rd Coloumn  */}
    </div>
  );
};

export default Footer;
