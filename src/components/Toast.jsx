import React, { useEffect } from "react";
import { useUIStore } from "../stores/uiStore";

export default function Toasts() {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 2000)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded shadow text-white ${
            toast.type === "error"
              ? "bg-red-500"
              : toast.type === "success"
              ? "bg-green-500"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
