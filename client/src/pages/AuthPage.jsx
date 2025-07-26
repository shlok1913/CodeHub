// src/pages/AuthPage.jsx
import {  useState } from "react";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    console.log("1");
    e.preventDefault();
    console.log("4");
    setError("");
    const endpoint = isLogin ? "/login" : "/signup";
    console.log("3");
    try {
      const res = await fetch(`http://localhost:3001/api/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("2");
      const data = await res.json();
      console.log("55");
      if (res.ok) {
        login(data.user, data.token);
        window.location.reload();
      } else {
        setError(data.message || "Auth failed");
      }
    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="flex flex-col justify-center px-10 py-12 w-full md:w-1/2 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-blue-600">Code<span className="text-gray-800">Hub</span></h1>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            {isLogin ? "Sign in to your account" : "Get started for free"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition"
          >
            {isLogin ? "Sign in →" : "Sign up →"}
          </button>
        </form>
      </div>

      {/* Right Panel */}
      <div className="hidden md:block w-1/2 bg-gradient-to-tr from-blue-600 via-purple-500 to-blue-400">
        <div className="w-full h-full backdrop-blur-sm" />
      </div>
    </div>
  );
}

export default AuthPage;
