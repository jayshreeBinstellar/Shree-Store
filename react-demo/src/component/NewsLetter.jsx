import { Email } from "@mui/icons-material";
import { useState, useEffect } from "react";

const NewsLetter = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setStatus("error");
            setMessage("Please enter a valid email address");
            return;
        }

        try {
            setStatus("loading");

            // Simulated API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setStatus("success");
            setMessage("Successfully subscribed!");
            setEmail("");
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        if (status === "success" || status === "error") {
            const timer = setTimeout(() => {
                setStatus(null);      
                setMessage(""); 
            }, 2000); 

            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="pt-10">
            <section className="relative overflow-hidden rounded-[48px] bg-indigo-900 mx-4">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 blur-[100px] -ml-48 -mb-48 rounded-full"></div>

                <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* LEFT CONTENT */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                <span className="text-white text-xs font-black uppercase tracking-widest">$20 Discount on First Order</span>
                            </div>

                            <h3 className=" mb-5! text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                                Join the <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 text-6xl">Healthy</span> <br />
                                Community
                            </h3>

                            <p className="text-gray-300 text-xl font-medium max-w-md leading-relaxed">
                                Get exclusive access to fresh harvests, premium deals, and organic living tips delivered to your inbox.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-4 max-w-xl"
                            >
                                <div className="flex-1 relative group">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-white placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-white/40 transition-all font-medium"
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                                        <Email />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="bg-white text-indigo-900 px-5 py-4 rounded-3xl font-black hover:bg-yellow-400 hover:text-black transition-all transform hover:-translate-y-1 disabled:opacity-50 shadow-xl shadow-black/20 text-lg"
                                >
                                    {status === "loading" ? "Subscribing..." : "Subscribe Now"}
                                </button>
                            </form>

                            {status === "success" && (
                                <div className="flex items-center gap-3 text-green-400 font-bold animate-in fade-in slide-in-from-top-2">
                                    <span>Welcome to the family! Check your inbox.</span>
                                </div>
                            )}

                            {status === "error" && (
                                <p className="text-red-400 font-bold">{message}</p>
                            )}
                        </div>

                        <div className="relative group flex justify-center lg:justify-end">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
                            <img
                                src="https://klbtheme.com/bacola/wp-content/uploads/2021/04/coupon.png"
                                alt="Subscribe"
                                className="relative max-w-md w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] group-hover:-rotate-3 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NewsLetter;
