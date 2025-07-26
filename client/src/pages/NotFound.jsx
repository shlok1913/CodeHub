// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
      <h2 className="text-2xl mb-2">Page Not Found</h2>
      <p className="mb-6 text-gray-400 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-md text-white font-medium shadow-md"
      >
        ⬅ Go back to Home Page
      </Link>
    </div>
  );
}
