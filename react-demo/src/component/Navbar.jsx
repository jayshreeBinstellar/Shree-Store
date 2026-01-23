import React, { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import LocationDropdown from "./LocationDropdown";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import SearchInput from "./SearchInput";
import Navigation from "./Navigation";
import { MyContext } from "../App";
import { useAuth } from "../context/AuthContext";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
const Navbar = ({ onSearch, onOpenCart, cartCount }) => {
  const context = useContext(MyContext);
  const { isAuthenticated, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-100 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg py-1" : "bg-white py-2"
      }`}>
      <header className="w-full">
        {/* TOP BAR - Optional, can keep for deals */}
        {/* <div className={`transition-all duration-300 overflow-hidden ${scrolled ? 'h-0' : 'h-6'} bg-gray-100 flex items-center justify-center`}>
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            <LocalShippingIcon/> Free shipping on all orders over $75
          </p>
        </div> */}

        <div className="container mx-auto px-4 mt-2">
          <div className="flex items-center justify-between gap-8">
            {/* LOGO */}
            <div className="shrink-0">
              <NavLink to="/main/dashboard" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xl italic">S</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-gray-900 tracking-tighter">Shree</h1>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest -mt-1">Organic Market</p>
                </div>
              </NavLink>
            </div>

            <LocationDropdown />

            {/* SEARCH */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <SearchInput onSearch={onSearch} />
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-indigo-600 font-black text-sm">24/7</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase leading-none">Support<br />Online</div>
              </div>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <NavLink
                      to="/main/account"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <PersonOutlineOutlinedIcon fontSize="small" />
                    </NavLink>
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className="px-3 py-1 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
                  >
                    Sign In
                  </NavLink>
                )}

                <div
                  className="relative group cursor-pointer"
                  onClick={onOpenCart}
                >
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md group-hover:bg-indigo-700 transition-all active:scale-95">
                    <LocalMallOutlinedIcon fontSize="small" />
                  </div>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white shadow-md">
                      {cartCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Navigation />

    </div >
  );
};

export default Navbar;
