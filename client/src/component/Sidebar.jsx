import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "elevators", label: "Elevators" },
    { key: "trips", label: "Trips" },
    // { key: "users", label: "Users" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
    setTimeout(() => toast.success("Logged out successfully!"), 500);
  };

  return (
    <div className=" bg-gray-900">
      <div className="w-60  text-white flex flex-col">
        <h1 className="text-2xl font-bold p-4 border-b border-gray-700">
          Admin Panel
        </h1>
        <ul className="flex-1">
          {tabs.map((tab) => (
            <li
              key={tab.key}
              className={`p-4 cursor-pointer ${
                activeTab === tab.key ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="p-4 mt-10 text-white hover:bg-gray-700 w-full"
        onClick={handleLogout}
      >
        Logout
      </div>
    </div>
  );
}
