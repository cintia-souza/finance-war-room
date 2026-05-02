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
  const id = placeholder.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Lock
        className="text-t-muted absolute top-1/2 left-4 -translate-y-1/2"
        size={18}
        aria-hidden="true"
      />
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        required
        className="border-t-border bg-t-surface text-t-text focus:ring-t-accent w-full rounded-2xl border py-4 pr-12 pl-11 outline-none focus:ring-2"
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-t-muted hover:text-t-text absolute top-1/2 right-4 -translate-y-1/2"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
