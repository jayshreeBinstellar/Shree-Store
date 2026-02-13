import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import { NavLink } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    dob: "",
    gender: ""
  });
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

  // Handle form submit
  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullname, email, password, dob, gender } = formData;

    if (!fullname || !email || !password) {
      setMessage("Please fill all required fields");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      const res = await register({ fullname, email, password, dob, gender });
      console.log("Register response:", res);

      if (res.status === true) {

        setMessage(res.message);
        login(res.token);

        setIsError(false);
        setTimeout(() => navigate("/main/dashboard"), 1500);
      } else {
        setMessage(res.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage(error?.message);
      setIsError(true);
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-h flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative"
      >
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Please fill in the details to register.
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

        {/* Full Name */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          />
        </div>

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
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Date of Birth */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Login Link */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <NavLink
              to="/auth/login"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign In
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
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>
    </div>

  );
};

export default Register;
