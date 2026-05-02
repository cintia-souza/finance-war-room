"use client";

export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    tap: () => vibrate(8),
    success: () => vibrate([10, 50, 10]),
    error: () => vibrate([30, 20, 30]),
    navigate: () => vibrate(15),
  };
}
