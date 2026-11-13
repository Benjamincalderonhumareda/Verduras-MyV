export function renderizarCuadricula(contenedor, productos, crearTarjeta) {
  contenedor.className = "grid grid-cols-1 gap-4 sm:grid-cols-2";
  productos.forEach(producto => contenedor.append(crearTarjeta(producto)));
}

export function renderizarCategoriasHorizontales(contenedor, productos, categorias, crearTarjeta) {
  const orden = ["verduras", "tuberculos", "hortalizas", "chinos"];
  const grupos = orden.map(clave => categorias.find(item => item.clave === clave));
  renderizarFilasHorizontales(contenedor, productos, grupos, crearTarjeta, "categoria");
}

export function renderizarFilasHorizontales(contenedor, productos, grupos, crearTarjeta, campoGrupo = "categoriaProducto") {
  contenedor.className = "space-y-6";

  grupos.forEach(grupo => {
    const productosGrupo = productos.filter(producto => producto[campoGrupo] === grupo.clave);
    if (!productosGrupo.length) return;

    const fila = document.createElement("section");
    fila.setAttribute("aria-label", grupo.nombre);

    const titulo = document.createElement("h3");
    titulo.className = "mb-3 text-2xl font-bold text-gray-900";
    titulo.textContent = grupo.nombre;

    const ayuda = document.createElement("p");
    ayuda.className = "-mt-2 mb-2 text-sm text-gray-600";
    ayuda.textContent = "Desliza hacia los lados para ver mas";

    const carrusel = document.createElement("div");
    carrusel.className = "-mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-4 pb-4 overscroll-x-contain";
    carrusel.setAttribute("role", "list");

    productosGrupo.forEach(producto => {
      const tarjeta = crearTarjeta(producto, true);
      tarjeta.setAttribute("role", "listitem");
      carrusel.append(tarjeta);
    });

    fila.append(titulo, ayuda, carrusel);
    contenedor.append(fila);
  });
}
