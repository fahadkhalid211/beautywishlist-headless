type ReportErrorOptions = {
  message: string;
  stack?: string;
  type: "react-error-boundary" | "global-error-boundary" | "window-error" | "unhandled-rejection";
};

export function reportError({ message, stack, type }: ReportErrorOptions) {
  try {
    const payload = {
      message,
      stack: stack || "",
      type,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    // Use sendBeacon when available so the report survives page unloads
    // (e.g. the user navigating away right as an error occurs), falling
    // back to a normal fetch otherwise.
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/log-error", blob);
      return;
    }

    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Error reporting must never itself throw.
  }
}
