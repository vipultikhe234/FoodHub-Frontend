import React from 'react';

const ApnaCartLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm inset-0 z-50 fixed">
      <div className="relative flex flex-col items-center">
        {/* Animated Cart Container */}
        <div className="relative animate-bounce mb-4 text-[#ff5722]">
          {/* ApnaCart SVG Graphic */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 512 512" 
            className="fill-current drop-shadow-xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M160 144c0-17.673-14.327-32-32-32H64c-17.673 0-32 14.327-32 32s14.327 32 32 32h32l42.4 201.2C143.1 391 155 400 169 400h187c14.6 0 27-10 29.8-24.4l33.8-173.6C423 184.8 409.8 176 396 176H179.7l-9.1-43.2C167.3 147 163.5 144 160 144zM192 464c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm160 0c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48z"/>
          </svg>
          
          {/* Action speed lines to simulate fast delivery motion */}
          <div className="absolute top-1/2 -left-8 w-6 h-1 bg-[#ff5722]/60 rounded-full animate-pulse shadow-md"></div>
          <div className="absolute top-2/3 -left-12 w-10 h-1 bg-[#ff5722]/40 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-3/4 -left-6 w-5 h-1 bg-[#ff5722]/80 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Brand Name Text */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 drop-shadow-sm">
            Apna<span className="text-[#ff5722]">Cart</span>
          </h1>
          
          {/* Simple subtle loading dots */}
          <div className="flex gap-1.5 mt-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-bounce shadow-sm" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5722]/80 animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5722]/60 animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApnaCartLoader;
