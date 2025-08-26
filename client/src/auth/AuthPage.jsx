import React, { useState } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function AuthPages() {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left — Illustration / marketing */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
          <h2 className="text-3xl font-extrabold mb-2">Welcome back!</h2>
          {mode === "login" ? (
            <p className="opacity-90">Sign in to continue to your dashboard</p>
          ) : (
            <p className="opacity-90">Create an account to get started</p>
          )}
        </div>

        {/* Right — Forms */}
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <div className="text-sm text-slate-500">
              {mode === "login" ? (
                <span>
                  New here?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>

          {mode === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm onSuccess={() => setMode("login")} />
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            By continuing you agree to our{" "}
            <button className="underline">Terms</button> and{" "}
            <button className="underline">Privacy Policy</button>.
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setLoading(true);
    try {
      console.log(BASE_URL);
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("adminToken", token);
      }
      toast.success("Login successful");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      toast.error("Failed to sign in. Try again.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ToastContainer
        position="top-center"
        autoClose={1000} // Closes after 3 seconds
      />

      {error && <div className="text-sm text-red-600">{error}</div>}

      <label className="block">
        <span className="text-sm font-medium text-slate-600">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Password</span>
          <button
            type="button"
            className="text-xs text-indigo-600"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required.";
    // simple email regex
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      e.email = "Email looks invalid.";
    if (!password) e.password = "Password is required.";
    if (password && password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!role) e.role = "Role is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    console.log(v);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      console.log(BASE_URL);

      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        role,
      });
      if (response.status === 200) {
        toast.success("Registration successful");
        onSuccess?.();
      }
    } catch (error) {
      setErrors({ form: "Failed to register. Try again later." }, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && <div className="text-sm text-red-600">{errors.form}</div>}

      <label className="block">
        <span className="text-sm font-medium text-slate-600">Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            errors.email ? "border-red-300" : "border-slate-200"
          }`}
        />
        {errors.email && (
          <div className="text-xs text-red-600 mt-1">{errors.email}</div>
        )}
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Password</span>
          <button
            type="button"
            className="text-xs text-indigo-600"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            errors.password ? "border-red-300" : "border-slate-200"
          }`}
        />
        {errors.password && (
          <div className="text-xs text-red-600 mt-1">{errors.password}</div>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-600">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            errors.role ? "border-red-300" : "border-slate-200"
          }`}
        >
          <option value="">Select a role</option>
          <option value="VIEWER">Viewer</option>
          <option value="OPERATOR">Operator</option>
          <option value="TECH">Tech</option>
          <option value="ADMIN">Admin</option>
        </select>
        {errors.role && (
          <div className="text-xs text-red-600 mt-1">{errors.role}</div>
        )}
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
