import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./UserContext"; 
import { CartProvider } from './carritoContext';


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <CartProvider>
    <UserProvider>  {/* Envuelves la app con el contexto de usuario */}
      <App />
    </UserProvider>
    </CartProvider>
  </Router>
);

