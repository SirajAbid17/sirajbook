import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-black via-gray-900 to-black text-gray-300 py-5 shadow-inner border-t border-gray-800">
      <div className="text-center space-y-2">
        <p className="text-sm md:text-base font-medium tracking-wide">
          Developed by :{" "}
          <a
            href="https://www.linkedin.com/in/sirajabid17/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-block text-blue-400 font-semibold hover:text-white transition-colors duration-300"
          >
            <span className="relative z-10">Siraj Abid</span>
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </p>

       
      </div>
    </footer>
  );
}
