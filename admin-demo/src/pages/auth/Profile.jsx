import React, { useState, useEffect } from "react";
import * as AdminService from "../../services/AdminService";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await AdminService.getProfile();

      setProfile(res.user);
      const formattedData = {
        ...res.user,
        dob: res.user.dob ? new Date(res.user.dob).toISOString().split('T')[0] : ''
      };
      setFormData(formattedData);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    const formattedData = {
      ...profile,
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''
    };
    setFormData(formattedData);
    setEditing(true);
  };

  const handleCancel = () => {
    const formattedData = {
      ...profile,
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''
    };
    setFormData(formattedData);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    setSaveLoading(true);
    setError("");

    try {
      const res = await AdminService.updateProfile(formData);

      const formattedUser = {
        ...res.user,
        dob: res.user.dob ? new Date(res.user.dob).toISOString().split('T')[0] : ''
      };
      setProfile(formattedUser);
      setFormData(formattedUser);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Profile update failed");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loader message="Loading profile..." />;

  if (!profile)
    return <div className="text-center p-8">No profile data available</div>;

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4">

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-slate-500">{profile?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="block font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full px-4 py-2 border rounded-xl ${
                editing
                  ? "bg-white border-indigo-300"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full px-4 py-2 border rounded-xl ${
                  editing
                    ? "bg-white border-indigo-300"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-2 py-3 border rounded-xl ${
                  editing
                    ? "bg-white border-indigo-300"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">

            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                Edit Profile
              </button>
            )}

            {editing && (
              <>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 border border-gray-300 rounded-xl"
                >
                  Cancel
                </button>
              </>
            )}

          </div>

        </form>

        {/* Change Password */}
        <div className="mt-8 pt-6 border-t">
          <Link
            to={"/change-password"}
            className="block text-center border border-indigo-600 text-indigo-600 py-3 rounded-xl hover:bg-indigo-50"
          >
            Change Password
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Profile;