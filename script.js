const categorias = [
  { clave: "tuberculos", archivo: "data/tuberculos.json", nombre: "Tub\u00e9rculos" },
  { clave: "verduras", archivo: "data/verduras.json", nombre: "Verduras" },
  { clave: "hortalizas", archivo: "data/hortalizas.json", nombre: "Hortalizas" },
  { clave: "chinos", archivo: "data/productoschinos.json", nombre: "Productos chinos" }
];

let productos = [];
let carrito = [];
let categoriaActual = "tuberculos";

const contenedorProductos = document.getElementById("productos");
const campoBusqueda = document.getElementById("buscador");
const estado = document.getElementById("estado");

async function cargarDatos() {
  try {
    const listas = await Promise.all(categorias.map(async categoria => {
      const respuesta = await fetch(categoria.archivo);
      if (!respuesta.ok) throw new Error(`No se pudo cargar ${categoria.nombre}`);
      const datos = await respuesta.json();
      return datos.map(producto => ({ ...producto, categoria: categoria.clave }));
    }));
    productos = listas.flat();
    aplicarFiltro();
  } catch (error) {
    estado.textContent = "No pudimos cargar los productos. Revisa tu conexion e intentalo otra vez.";
    console.error(error);
  }
}

function crearBoton(texto, accesible, clases) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  boton.setAttribute("aria-label", accesible);
  boton.className = `min-h-14 rounded-xl ${clases} focus:outline-none focus:ring-4 focus:ring-green-200`;
  return boton;
}

function mostrar(lista) {
  contenedorProductos.replaceChildren();
  estado.textContent = lista.length ? `${lista.length} productos disponibles` : "No encontramos productos con ese nombre.";

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = "lazy";
    imagen.className = "mb-3 h-36 w-full rounded-xl bg-green-50 object-cover";
    imagen.addEventListener("error", () => imagen.remove());

    const nombre = document.createElement("h3");
    nombre.className = "text-2xl font-bold";
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "mt-1 text-lg font-semibold text-green-800";
    precio.textContent = `Precio: S/ ${Number(producto.precio).toFixed(2)} por kilo`;

    const notaPrecioUnidad = document.createElement("p");
    notaPrecioUnidad.className = "mt-1 text-sm text-gray-600";
    notaPrecioUnidad.textContent = "Puede pedir por kilo o Unidad";

    const etiqueta = document.createElement("label");
    etiqueta.className = "mt-4 block text-lg font-semibold";

    const tipo = document.createElement("input");
    tipo.type = "hidden";
    tipo.value = "kg";

    const opciones = document.createElement("div");
    opciones.className = "mt-2 grid grid-cols-2 gap-2";
    const botonKg = crearBoton("Por kilos", "Elegir cantidad por kilos", "bg-green-700 font-bold text-white");
    const botonUnidad = crearBoton("Por unidad", "Elegir cantidad por unidad", "bg-gray-100 font-bold text-gray-900");
    const seleccionarTipo = nuevoTipo => {
      tipo.value = nuevoTipo;
      botonKg.className = `min-h-14 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 ${nuevoTipo === "kg" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900"} font-bold`;
      botonUnidad.className = `min-h-14 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 ${nuevoTipo === "unidad" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900"} font-bold`;
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
    controles.className = "mt-2 grid grid-cols-[3.5rem_1fr_3.5rem] gap-2";
    const menos = crearBoton("-", "Restar cantidad", "bg-gray-100 text-2xl text-gray-900");
    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.step = "0.5";
    cantidad.min = "0.5";
    cantidad.inputMode = "decimal";
    cantidad.className = "min-h-14 w-full rounded-xl border-2 border-gray-300 px-3 text-center text-xl focus:border-green-700 focus:outline-none";
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

    const agregar = crearBoton("Agregar al pedido", "Agregar al pedido", "mt-3 w-full bg-green-700 text-lg font-bold text-white hover:bg-green-800");
    agregar.addEventListener("click", () => agregarAlCarrito(producto, cantidad, tipo.value));
    tarjeta.append(imagen, nombre, precio, notaPrecioUnidad, opciones, etiqueta, controles, agregar);
    contenedorProductos.append(tarjeta);
  });
}

function aplicarFiltro() {
  const texto = campoBusqueda.value.trim().toLocaleLowerCase("es");
  const filtrados = productos.filter(producto =>
    (categoriaActual === "todos" || producto.categoria === categoriaActual) &&
    producto.nombre.toLocaleLowerCase("es").includes(texto)
  );
  mostrar(filtrados);
}

function seleccionarCategoria(categoria) {
  categoriaActual = categoria;
  const elegida = categorias.find(item => item.clave === categoria);
  document.getElementById("tituloCategoria").textContent = elegida?.nombre ?? "Todos los productos";
  document.querySelectorAll(".categoria").forEach(boton => {
    const activa = boton.dataset.categoria === categoria;
    boton.classList.toggle("bg-white", activa);
    boton.classList.toggle("text-green-800", activa);
    boton.setAttribute("aria-pressed", String(activa));
  });
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("menuBoton").setAttribute("aria-expanded", "false");
  aplicarFiltro();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function agregarAlCarrito(producto, campo, tipo) {
  const cantidad = Number(campo.value);
  if (!Number.isFinite(cantidad) || cantidad <= 0 || (tipo === "unidad" && !Number.isInteger(cantidad))) {
    campo.focus();
    alert(tipo === "kg" ? "Indica cuantos kilos deseas." : "Indica una cantidad entera de unidades.");
    return;
  }
  carrito.push({ nombre: producto.nombre, cantidad, tipo });
  campo.value = "";
  actualizarCarrito();
  document.getElementById("pedidoDetalle").open = true;
}

function actualizarCarrito() {
  const lista = document.getElementById("lista");
  lista.replaceChildren();
  carrito.forEach((item, indice) => {
    const fila = document.createElement("li");
    fila.className = "flex items-center justify-between gap-2 border-b border-gray-200 py-1";
    const detalle = document.createElement("span");
    const unidad = item.tipo === "kg" ? (item.cantidad === 1 ? "kilo" : "kilos") : (item.cantidad === 1 ? "unidad" : "unidades");
    detalle.textContent = `${item.nombre}: ${item.cantidad} ${unidad}`;
    const quitar = crearBoton("Quitar", `Quitar ${item.nombre}`, "min-h-10 px-3 text-sm font-semibold text-red-700");
    quitar.addEventListener("click", () => {
      carrito.splice(indice, 1);
      actualizarCarrito();
    });
    fila.append(detalle, quitar);
    lista.append(fila);
  });
}

function enviarPedido() {
  if (!carrito.length) {
    alert("Agrega al menos un producto antes de enviar tu pedido.");
    return;
  }
  const horario = document.getElementById("horario").value.trim();
  if (!horario) {
    document.getElementById("horario").focus();
    alert("Escribe el rango horario que prefieres.");
    return;
  }
  const lineas = [
    "Hola, quisiera hacer este pedido:",
    ...carrito.map(item => `- ${item.nombre}: ${item.cantidad} ${item.tipo === "kg" ? "kg" : "unidades"}`),
    `Horario preferido: ${horario}`,
    "Entiendo que el precio final puede variar al pesar los productos."
  ];
  const url = `https://wa.me/51949485082?text=${encodeURIComponent(lineas.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.getElementById("menuBoton").addEventListener("click", event => {
  const menu = document.getElementById("menu");
  const abierto = menu.classList.toggle("hidden") === false;
  event.currentTarget.setAttribute("aria-expanded", String(abierto));
});
document.querySelectorAll(".categoria").forEach(boton => {
  boton.addEventListener("click", () => seleccionarCategoria(boton.dataset.categoria));
});
campoBusqueda.addEventListener("input", aplicarFiltro);
document.getElementById("enviarPedido").addEventListener("click", enviarPedido);
seleccionarCategoria("tuberculos");
cargarDatos();
