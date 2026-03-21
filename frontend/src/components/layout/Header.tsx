"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-[17px] font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-500 w-56 cursor-pointer hover:bg-gray-200 transition-colors">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <span className="ml-auto text-xs text-gray-400 font-medium">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-700">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{user.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
