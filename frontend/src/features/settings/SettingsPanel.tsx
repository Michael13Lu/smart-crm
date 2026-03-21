"use client";

import { useAuth } from "@/lib/auth-context";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: "Full access to all features including user management.",
  Manager: "Can manage leads, deals, and tasks assigned to them.",
  Viewer: "Read-only access to all data.",
};

export function SettingsPanel() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-700">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              defaultValue={user.fullName}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              defaultValue={user.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Role & Permissions</h2>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">{user.role}</p>
          <p className="text-sm text-gray-500">{ROLE_DESCRIPTIONS[user.role]}</p>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Contact your administrator to change your role.
        </p>
      </div>

      {/* Demo notice */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
        <p className="text-sm font-semibold text-indigo-800 mb-1">Live API Mode</p>
        <p className="text-sm text-indigo-600">
          Connected to real backend. Data persists across sessions.
        </p>
      </div>
    </div>
  );
}
