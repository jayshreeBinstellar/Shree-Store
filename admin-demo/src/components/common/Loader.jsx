import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Loader = ({ fullScreen = false, message = "Loading..." }) => {
    const loaderContent = (
        <div className="flex flex-col items-center gap-3">
           <CircularProgress size={30} style={{ color: '#4f46e5' }} />
            {message && (
                <p className="text-sm text-gray-600 font-medium">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center ">
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