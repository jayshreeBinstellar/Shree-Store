import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Loader = ({ fullScreen = false, message = "Loading" }) => {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest animate-pulse">
                    {message}
                </span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full py-12 min-h-[300px]">
            {loaderContent}
        </div>
    );
};

export default Loader;
