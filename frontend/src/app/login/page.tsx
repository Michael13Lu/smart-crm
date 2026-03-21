"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@smartcrm.demo", password: "Demo@123!" },
  { label: "Manager", email: "sarah@smartcrm.demo", password: "Demo@123!" },
  { label: "Viewer", email: "emily@smartcrm.demo", password: "Demo@123!" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@smartcrm.demo");
  const [password, setPassword] = useState("Demo@123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-slate-900 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Smart CRM</span>
        </div>

        <div>
          <blockquote className="text-2xl font-light leading-relaxed text-slate-200 mb-8">
            &ldquo;Smart CRM helped us close 40% more deals in the first
            quarter. The pipeline view alone is worth it.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-semibold">
              SR
            </div>
            <div>
              <p className="font-medium">Sofia Rodriguez</p>
              <p className="text-sm text-slate-400">Head of Sales, Acme Corp</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500">&copy; 2026 Smart CRM. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Smart CRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-gray-500 text-sm">Sign in to your account</p>
          </div>

          {/* Demo quick-fill */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
              Demo accounts
            </p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    email === acc.email
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            All demo accounts use password:{" "}
            <span className="font-mono font-medium">Demo@123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
