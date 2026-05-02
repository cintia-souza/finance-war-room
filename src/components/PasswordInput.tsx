"use client";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function PasswordInput({ placeholder, value, onChange }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        required
        className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pr-12 pl-11 outline-none focus:ring-2 focus:ring-blue-600"
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
