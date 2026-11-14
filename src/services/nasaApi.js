const NASA_API = "https://images-api.nasa.gov";

export async function buscarImagenesNASA(busqueda = "Opportunity rover") {
  const parametros = new URLSearchParams({
    q: busqueda,
    media_type: "image",
    page_size: "12",
  });

  const respuesta = await fetch(
    `${NASA_API}/search?${parametros}`
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener imágenes de la NASA");
  }

  const resultado = await respuesta.json();

  return resultado.collection.items.map((item) => ({
    id: item.data?.[0]?.nasa_id,
    titulo: item.data?.[0]?.title,
    descripcion: item.data?.[0]?.description,
    fecha: item.data?.[0]?.date_created,
    imagen: item.links?.find(
      (link) => link.rel === "preview"
    )?.href,
    credito: item.data?.[0]?.secondary_creator,
  }));
}
