import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { MyContext } from "../App";

const LocationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Select a Location");

  const context = useContext(MyContext);

  const filteredCountries = (context?.country ?? []).filter((item) =>
  item.toLowerCase().includes(search.toLowerCase())
);

  const handleSelect = (location) => {
    setSelected(location);
    setOpen(false);
  };

  return (
    <div className="max-w-46">
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        className="flex! item-center! gap-3! px-5 bg-gray-50 border-2 border-transparent hover:border-indigo-100 hover:bg-white rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg group"
      >
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-70">
            Delivery to
          </span>
          <span className="text-sm font-bold text-gray-900 truncate block transition-colors group-hover:text-indigo-600">
            {selected.length > 20 ? `${selected.slice(0, 20)}...` : selected}
          </span>
        </div>
        <KeyboardArrowDownOutlinedIcon className="text-gray-400 group-hover:text-indigo-600 transition-colors ml-2" />
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className:
            "!rounded-[32px] !p-2 !shadow-2xl !max-h-[85vh] !overflow-hidden"
        }}
      >
        <div className="p-4 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 top-1 w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
          >
            <CloseIcon fontSize="small" />
          </button>

          <div className="mb-2">
            <h5 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Delivery Location</h5>
            <p className="text-sm text-gray-500 font-medium">Select a location to see accurate product availability and delivery times.</p>
          </div>

          {/* Search */}
          <div className="relative group">
            <div className="flex items-center bg-gray-200 border-2 border-transparent focus-within:border-indigo-600 focus-within:bg-white h-10 rounded-lg px-5 transition-all duration-300">
              <SearchOutlinedIcon className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" outline-none w-full text-base font-medium px-4 placeholder:text-gray-400 placeholder:font-normal"
                placeholder="Search your city or zip..."
              />
            </div>
          </div>

          <div className="mt-5">
            <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Available Regions</h6>
            <ul className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((item, index) => {
                  const isActive = item === selected;

                  return (
                    <li key={index}>
                      <Button
                        onClick={() => handleSelect(item)}
                        className={`w-full justify-start text-left px-2 py-2 rounded-2xl transition-all
                        ${isActive
                            ? "bg-indigo-600! text-white! font-bold shadow-sm shadow-indigo-500/30"
                            : "text-gray-900! font-semibold hover:bg-gray-100"
                          }`}
                      >
                        <span className="flex-1">{item}</span>
                        {isActive && <span className="text-white">✓</span>}
                      </Button>
                    </li>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 font-medium">No locations found matching your search</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LocationDropdown;
