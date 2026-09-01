"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorReporting";

export default function GlobalErrorListener() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      reportError({
        message: event.message || "Unknown window error",
        stack: event.error?.stack,
        type: "window-error",
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportError({
        message: reason?.message || String(reason) || "Unhandled promise rejection",
        stack: reason?.stack,
        type: "unhandled-rejection",
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
