import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const OrderStatusTimeline = ({ status }) => {
    const steps = ["Ordered", "Shipped", "Delivered"];

    // Hide timeline if order is successfully delivered
    if (status?.toLowerCase() === 'delivered') return null;

    const currentStepIndex = steps.findIndex(s => s.toLowerCase() === status?.toLowerCase());

    const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;



    return (
        <div className="w-full mt-4 px-2">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 left-[5%] h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 90}%` }}
                ></div>


                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isActive = index === activeIndex;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? "bg-green-500 scale-110 shadow-lg shadow-green-100" : "bg-white border-2 border-gray-100"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest mt-2  ${isCompleted ? "text-green-600" : "text-gray-300"
                                }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusTimeline;
