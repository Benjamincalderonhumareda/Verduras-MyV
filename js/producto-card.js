let ajusteNombresPendiente = false;

function programarAjusteNombres() {
  if (ajusteNombresPendiente) return;
  ajusteNombresPendiente = true;
  requestAnimationFrame(() => {
    ajusteNombresPendiente = false;
    document.querySelectorAll(".product-name").forEach(nombre => {
      if (!nombre.clientWidth) return;
      let tamano = 24;
      nombre.style.fontSize = `${tamano}px`;
      while (nombre.scrollHeight > nombre.clientHeight && tamano > 16) {
        tamano -= 1;
        nombre.style.fontSize = `${tamano}px`;
      }
    });
  });
}

window.addEventListener("resize", programarAjusteNombres);
document.fonts?.ready.then(programarAjusteNombres);

function crearBoton(texto, accesible, clases) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  boton.setAttribute("aria-label", accesible);
  boton.className = `min-h-[44px] rounded-xl text-sm ${clases} focus:outline-none focus:ring-4 focus:ring-green-200`;
  return boton;
}

export function crearTarjeta(producto, agregarALista, horizontal = false) {
  const tarjeta = document.createElement("article");
  tarjeta.dataset.productoNombre = producto.nombre;
  tarjeta.dataset.productoCategoria = producto.categoria;
  tarjeta.tabIndex = -1;
  tarjeta.className = horizontal
    ? "w-[82vw] max-w-[20rem] shrink-0 snap-start rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:w-72"
    : "w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm";

  const imagen = document.createElement("img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;
  imagen.loading = "lazy";
  imagen.className = "mb-3 h-48 w-full rounded-xl bg-white object-contain";
  imagen.addEventListener("error", () => {
    const aviso = document.createElement("p");
    aviso.className = "mb-3 flex h-48 items-center justify-center rounded-xl bg-green-50 text-base text-gray-600";
    aviso.textContent = "Foto no disponible";
    imagen.replaceWith(aviso);
  }, { once: true });

  const nombre = document.createElement("h4");
  nombre.className = "product-name font-bold";
  nombre.textContent = producto.nombre;

  const precio = document.createElement("p");
  precio.className = "mt-1 text-lg font-semibold text-green-800";
  precio.textContent = `Precio: S/ ${Number(producto.precio).toFixed(2)} por kilo`;

  const notaPrecioUnidad = document.createElement("p");
  notaPrecioUnidad.className = "mt-1 text-sm text-gray-600";
  notaPrecioUnidad.textContent = "Puede pedir por kilo o Unidad";

  const etiqueta = document.createElement("label");
  etiqueta.className = "mt-3 block text-base font-semibold";
  const tipo = document.createElement("input");
  tipo.type = "hidden";
  tipo.value = "kg";

  const opciones = document.createElement("div");
  opciones.className = "mt-2 grid grid-cols-2 gap-2";
  const botonKg = crearBoton("Por kilos", "Elegir cantidad por kilos", "bg-green-700 font-bold text-white");
  const botonUnidad = crearBoton("Por unidad", "Elegir cantidad por unidad", "bg-gray-100 font-bold text-gray-900");

  const cantidad = document.createElement("input");
  cantidad.type = "number";
  cantidad.step = "0.5";
  cantidad.min = "0.5";
  cantidad.inputMode = "decimal";
  cantidad.className = "min-h-[44px] min-w-0 w-full rounded-xl border-2 border-gray-300 px-2 text-center text-lg focus:border-green-700 focus:outline-none";

  const seleccionarTipo = nuevoTipo => {
    tipo.value = nuevoTipo;
    botonKg.className = `min-h-[44px] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-green-200 ${nuevoTipo === "kg" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900"} font-bold`;
    botonUnidad.className = `min-h-[44px] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-green-200 ${nuevoTipo === "unidad" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900"} font-bold`;
    etiqueta.textContent = nuevoTipo === "kg" ? "Cantidad en kilos" : "Cantidad de unidades";
    cantidad.step = nuevoTipo === "kg" ? "0.5" : "1";
    cantidad.min = nuevoTipo === "kg" ? "0.5" : "1";
    cantidad.placeholder = nuevoTipo === "kg" ? "Ej. 1 o 1.5" : "Ej. 1, 2, 3...";
    cantidad.setAttribute("aria-label", `${etiqueta.textContent} de ${producto.nombre}`);
  };
  botonKg.addEventListener("click", () => seleccionarTipo("kg"));
  botonUnidad.addEventListener("click", () => seleccionarTipo("unidad"));
  opciones.append(botonKg, botonUnidad);

  const controles = document.createElement("div");
  controles.className = "mt-2 grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2";
  const menos = crearBoton("-", "Restar cantidad", "bg-gray-100 text-2xl text-gray-900");
  const mas = crearBoton("+", "Aumentar cantidad", "bg-gray-100 text-2xl text-gray-900");
  const cambiar = delta => {
    const paso = tipo.value === "kg" ? 0.5 : 1;
    const actual = Number(cantidad.value) || 0;
    cantidad.value = Math.max(0, Math.round((actual + delta * paso) * 10) / 10) || "";
  };
  menos.addEventListener("click", () => cambiar(-1));
  mas.addEventListener("click", () => cambiar(1));
  etiqueta.htmlFor = `cantidad-${producto.categoria}-${producto.id}`;
  cantidad.id = etiqueta.htmlFor;
  controles.append(menos, cantidad, mas);
  seleccionarTipo("kg");

  const agregar = crearBoton("Agregar a la lista", "Agregar a la lista", "mt-3 w-full bg-green-700 font-bold text-white hover:bg-green-800");
  agregar.addEventListener("click", () => agregarALista(producto, cantidad, tipo.value));
  tarjeta.append(imagen, nombre, precio, notaPrecioUnidad, opciones, etiqueta, controles, agregar);
  programarAjusteNombres();
  return tarjeta;
}
