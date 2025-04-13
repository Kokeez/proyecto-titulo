import { useEffect, useState } from "react";
import React from "react";


function App() {
  const [mensaje, setMensaje] = useState("Cargando...");

  useEffect(() => {
    console.log("Intentando hacer fetch a la API...");
  
    fetch("http://localhost:8000/api/saludo/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta del backend:", data);
        setMensaje(data.mensaje);
      })
      .catch((err) => {
        console.error("Error al conectar con el backend:", err);
        setMensaje("Error al conectar");
      });
  }, []);
  

  return (
  <>
  <h1>{mensaje}</h1>
  <p>funciona porfavor</p>
  </>
)
}

export default App;
