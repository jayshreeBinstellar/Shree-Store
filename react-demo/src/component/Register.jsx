import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/AuthService';

const Register = () => {
  const navigate = useNavigate();

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

      if (res.status === "success") {
        setMessage(res.message);
        setIsError(false);
        setTimeout(() => navigate("/"), 1500);
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
    <div className="min-h-screen flex items-center justify-center ">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {message && (
          <p className={`mb-4 text-center ${isError ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-4 py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
