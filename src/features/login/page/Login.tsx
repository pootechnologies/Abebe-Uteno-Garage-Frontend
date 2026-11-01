import React, { useState } from "react";
import { Lightbulb, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/login";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner.tsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      // Save tokens
      localStorage.setItem("token", data.access);
      localStorage.setItem("access_token", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);

      navigate("/");
      window.location.reload();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials and try again."
      );
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] dark:bg-slate-950 justify-center">
      {/* Form Container */}
      <div className="w-full max-w-[540px] flex flex-col justify-between items-center p-6 sm:p-12 relative min-h-screen">
        {/* Invisible spacer to balance the footer and keep the form perfectly centered */}
        <div className="h-4 sm:h-8 shrink-0"></div>

        <div className="w-full my-auto space-y-10 py-6 animate-in fade-in slide-in-from-right-4 duration-700">

          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="text-white h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              PO'O <span className="text-blue-600">Technologies</span>
            </h2>
          </div>

          {/* Login Form View */}
          <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest justify-center sm:justify-start w-full">
                <Sparkles className="h-4 w-4" />
                <span>Platform Authentication</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back.</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your details to access your account.</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in slide-in-from-top-2">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="group relative transition-all">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                </div>
                <div className="group relative transition-all">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center gap-3 justify-center">
                    <Spinner className="h-5 w-5 text-white dark:text-slate-900 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>

        </div>

        {/* Footer Info */}
        <div className="w-full px-6 pt-6 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 PO'O TECHNOLOGIES. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
