import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-semibold tracking-wide">🚀 CodeHub</h1>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300 hidden sm:inline">
          Logged in as <strong>{user?.email || "User"}</strong>
        </span>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md transition duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
