
import { useState } from "react";
import { buscarImagenesNASA } from "../services/nasaApi";

function GaleriaNASA() {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarImagenes = async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await buscarImagenesNASA();
      setImagenes(datos);
    } catch (error) {
      setError("No pudimos cargar las imágenes de NASA.");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <section>
      <h2>Explorando Marte con Opportunity</h2>

      <button onClick={cargarImagenes} disabled={cargando}>
        {cargando ? "Cargando..." : "Ver imágenes NASA"}
      </button>

      {error && <p role="alert">{error}</p>}

      <div className="galeria-nasa">
        {imagenes.filter((item) => item.imagen).map((item) => (
          <article key={item.id}>
            <img
              src={item.imagen}
              alt={item.titulo || "Imagen de la NASA"}
              loading="lazy"
              width="250"
            />
            <h3>{item.titulo}</h3>
            <p>{item.fecha?.slice(0, 10)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GaleriaNASA;
