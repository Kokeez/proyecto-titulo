import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./UserContext";  // Importa el proveedor del contexto

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <UserProvider>  {/* Envuelves la app con el contexto de usuario */}
      <App />
    </UserProvider>
  </Router>
);

