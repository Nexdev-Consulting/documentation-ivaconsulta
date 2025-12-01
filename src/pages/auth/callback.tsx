import React, { useEffect, useState } from "react";

export default function AuthCallback() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Show help message if stuck for more than 5 seconds
    const timer = setTimeout(() => {
      setShowHelp(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "1.2rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p>Finishing sign-in…</p>
      {showHelp && (
        <div
          style={{
            marginTop: "2rem",
            fontSize: "0.9rem",
            color: "#666",
            maxWidth: "500px",
          }}
        >
          <p>Taking longer than expected?</p>
          <p>Please check the browser console (F12) for error messages.</p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
}
