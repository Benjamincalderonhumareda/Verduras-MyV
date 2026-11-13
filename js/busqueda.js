export function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function buscarProductos(productos, consulta) {
  const palabras = normalizarTexto(consulta).split(/\s+/).filter(Boolean);
  if (!palabras.length) return [];
  return productos.filter(producto => {
    const nombre = normalizarTexto(producto.nombre);
    return palabras.every(palabra => nombre.includes(palabra));
  });
}
