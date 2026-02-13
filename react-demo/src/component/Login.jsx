import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/AuthService'; // rename to avoid conflict
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { NavLink } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value === "") {
      setMessage("");
      setIsError(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setMessage("Please enter both email and password");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      const res = await apiLogin({ email, password });
      console.log("Login response:", res);

      if (res.status === "success") {
        login(res.token); // Update AuthContext state

        navigate("/main/dashboard");
      } else {
        setMessage(res.message);
        setIsError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-h flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative"
      >
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Sign In
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`mb-4 text-center text-sm font-semibold ${isError ? "text-red-500" : "text-green-600"
              }`}
          >
            {message}
          </p>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full h-12 px-4 pr-12 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          />
          <span
            className="absolute right-2 bottom-4 cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData({ ...formData, rememberMe: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <NavLink
            to="/auth/forgot-password"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Forgot Password?
          </NavLink>
        </div>

        <div className="text-center m-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <NavLink
              to="/auth/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign Up
            </NavLink>
          </p>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );

};

export default Login;
