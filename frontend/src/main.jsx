import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Styles globaux (avec Tailwind + ton style pixel)
import "./index.css";

// Providers globaux
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
