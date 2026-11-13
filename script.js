import { categorias } from "./js/categorias/index.js";
import { crearTarjeta } from "./js/producto-card.js";
import { renderizarCategoriasHorizontales } from "./js/renderizador.js";
import { leerListaGuardada, guardarLista } from "./js/lista-storage.js";
import { buscarProductos } from "./js/busqueda.js";

let productos = [];
let listaProductos = [];
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
      return datos.map(producto => ({
        ...producto,
        categoria: categoria.clave,
        categoriaProducto: producto.categoria
      }));
    }));
    productos = listas.flat();
    aplicarFiltro();
    mostrarSugerencias();
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
  const categoria = categorias.find(item => item.clave === categoriaActual);
  document.getElementById("tituloCategoria").textContent = categoriaActual === "todos"
    ? "Todos los productos"
    : categoria.nombre;
  if (!lista.length) return;

  const crear = (producto, horizontal = false) => crearTarjeta(producto, agregarALista, horizontal);
  if (categoriaActual === "todos") {
    renderizarCategoriasHorizontales(contenedorProductos, lista, categorias, crear);
    return;
  }

  categoria.render(contenedorProductos, lista, crear);
}

function aplicarFiltro() {
  const coincidencias = campoBusqueda.value.trim() ? buscarProductos(productos, campoBusqueda.value) : productos;
  const filtrados = coincidencias.filter(producto => categoriaActual === "todos" || producto.categoria === categoriaActual);
  mostrar(filtrados);
}

function cerrarSugerencias() {
  document.getElementById("sugerenciasBusqueda").classList.add("hidden");
}

function mostrarSugerencias() {
  const sugerencias = document.getElementById("sugerenciasBusqueda");
  sugerencias.replaceChildren();
  if (!campoBusqueda.value.trim()) {
    cerrarSugerencias();
    document.getElementById("estadoBusqueda").textContent = "";
    return;
  }
  const encontrados = buscarProductos(productos, campoBusqueda.value);
  document.getElementById("estadoBusqueda").textContent = `${encontrados.length} productos encontrados.`;
  encontrados.forEach(producto => {
    const fila = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "block min-h-12 w-full border-b border-green-100 px-4 py-3 text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-700";
    const nombre = document.createElement("span");
    nombre.className = "block text-lg font-semibold";
    nombre.textContent = producto.nombre;
    const categoria = document.createElement("span");
    categoria.className = "block text-sm text-gray-600";
    categoria.textContent = categorias.find(item => item.clave === producto.categoria).nombre;
    boton.append(nombre, categoria);
    boton.addEventListener("click", () => irAProducto(producto));
    fila.append(boton);
    sugerencias.append(fila);
  });
  if (!encontrados.length) {
    const mensaje = document.createElement("li");
    mensaje.className = "px-4 py-3 text-gray-600";
    mensaje.textContent = "No encontramos productos con ese nombre.";
    sugerencias.append(mensaje);
  }
  sugerencias.classList.remove("hidden");
}

function irAProducto(producto) {
  seleccionarCategoria(producto.categoria);
  requestAnimationFrame(() => {
    const tarjeta = [...contenedorProductos.querySelectorAll("[data-producto-nombre]")]
      .find(elemento => elemento.dataset.productoNombre === producto.nombre && elemento.dataset.productoCategoria === producto.categoria);
    if (!tarjeta) return;
    tarjeta.classList.add("product-found");
    const fila = tarjeta.parentElement;
    if (fila.scrollWidth > fila.clientWidth) {
      fila.scrollLeft += tarjeta.getBoundingClientRect().left - fila.getBoundingClientRect().left - 16;
    }
    tarjeta.focus({ preventScroll: true });
    const margen = document.querySelector("header").getBoundingClientRect().height + 16;
    window.scrollTo({ top: Math.max(0, window.scrollY + tarjeta.getBoundingClientRect().top - margen), behavior: "instant" });
  });
}

function seleccionarCategoria(clave) {
  categoriaActual = clave;
  document.querySelectorAll(".categoria").forEach(boton => {
    const activa = boton.dataset.categoria === clave;
    boton.setAttribute("aria-pressed", String(activa));
    if (activa) boton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  });
  campoBusqueda.value = "";
  cerrarSugerencias();
  aplicarFiltro();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function agregarALista(producto, campo, tipo) {
  const cantidad = Number(campo.value);
  if (!Number.isFinite(cantidad) || cantidad <= 0 || (tipo === "unidad" && !Number.isInteger(cantidad))) {
    campo.focus();
    alert(tipo === "kg" ? "Indica cuantos kilos deseas." : "Indica una cantidad entera de unidades.");
    return;
  }
  listaProductos.push({ nombre: producto.nombre, cantidad, tipo });
  campo.value = "";
  actualizarLista();
  document.getElementById("avisoLista").textContent = `${producto.nombre} agregado a tu lista.`;
}

function actualizarLista() {
  const lista = document.getElementById("lista");
  lista.replaceChildren();
  document.getElementById("cantidadLista").textContent = listaProductos.length;
  document.getElementById("listaVacia").classList.toggle("hidden", listaProductos.length > 0);
  document.getElementById("enviarPedido").disabled = listaProductos.length === 0;
  listaProductos.forEach((item, indice) => {
    const fila = document.createElement("li");
    fila.className = "flex items-center justify-between gap-2 border-b border-gray-200 py-1";
    const detalle = document.createElement("span");
    const unidad = item.tipo === "kg" ? (item.cantidad === 1 ? "kilo" : "kilos") : (item.cantidad === 1 ? "unidad" : "unidades");
    detalle.textContent = `${item.nombre}: ${item.cantidad} ${unidad}`;
    const quitar = crearBoton("Quitar", `Quitar ${item.nombre}`, "min-h-10 px-3 text-sm font-semibold text-red-700");
    quitar.addEventListener("click", () => {
      listaProductos.splice(indice, 1);
      actualizarLista();
    });
    fila.append(detalle, quitar);
    lista.append(fila);
  });
  guardarListaLocal();
}

function guardarListaLocal() {
  const guardado = guardarLista(listaProductos, document.getElementById("horario").value);
  document.getElementById("estadoGuardado").textContent = guardado
    ? "Tu lista se guarda automaticamente en este navegador."
    : "Este navegador no permite guardar la lista. Si recargas, podrias perderla.";
}

function enviarLista() {
  if (!listaProductos.length) {
    alert("Agrega al menos un producto antes de enviar tu lista.");
    return;
  }
  const horario = document.getElementById("horario").value.trim();
  if (!horario) {
    document.getElementById("horario").focus();
    alert("Escribe el rango de envio que prefieres.");
    return;
  }
  const lineas = [
    "Hola, quisiera solicitar los productos de esta lista:",
    ...listaProductos.map(item => `- ${item.nombre}: ${item.cantidad} ${item.tipo === "kg" ? "kg" : "unidades"}`),
    `Rango de envio preferido: ${horario}`,
    "Entiendo que el precio final puede variar al pesar los productos."
  ];
  const url = `https://wa.me/51949485082?text=${encodeURIComponent(lineas.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".categoria").forEach(boton => {
  boton.addEventListener("click", () => {
    mostrarVistaLista(false);
    seleccionarCategoria(boton.dataset.categoria);
    document.getElementById("tituloCategoria").focus({ preventScroll: true });
  });
});

function mostrarVistaLista(abierta) {
  document.getElementById("vistaLista").classList.toggle("hidden", !abierta);
  document.getElementById("vistaCatalogo").classList.toggle("hidden", abierta);
  document.querySelectorAll('.categoria').forEach(boton => {
    boton.setAttribute('aria-pressed', String(!abierta && boton.dataset.categoria === categoriaActual));
  });
  document.getElementById("abrirLista").setAttribute("aria-pressed", String(abierta));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (abierta) document.getElementById("tituloLista").focus({ preventScroll: true });
  else document.getElementById("abrirLista").focus({ preventScroll: true });
}

document.getElementById("abrirLista").addEventListener("click", () => mostrarVistaLista(true));
document.getElementById("volverProductos").addEventListener("click", () => mostrarVistaLista(false));
campoBusqueda.addEventListener("input", () => {
  aplicarFiltro();
  mostrarSugerencias();
});
campoBusqueda.addEventListener("focus", mostrarSugerencias);
campoBusqueda.addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    const primero = buscarProductos(productos, campoBusqueda.value)[0];
    if (primero) { evento.preventDefault(); irAProducto(primero); }
  }
  if (evento.key === "ArrowDown") {
    const primero = document.querySelector("#sugerenciasBusqueda button");
    if (primero) { evento.preventDefault(); primero.focus(); }
  }
});
document.getElementById("zonaBusqueda").addEventListener("keydown", evento => {
  if (evento.key === "Escape") {
    campoBusqueda.focus();
    cerrarSugerencias();
  }
});
document.addEventListener("click", evento => {
  if (!evento.target.closest("#zonaBusqueda")) cerrarSugerencias();
});
document.addEventListener("focusin", evento => {
  if (!evento.target.closest("#zonaBusqueda")) cerrarSugerencias();
});
document.getElementById("enviarPedido").addEventListener("click", enviarLista);
document.getElementById("horario").addEventListener("input", guardarListaLocal);
const listaGuardada = leerListaGuardada();
listaProductos = listaGuardada.productos;
document.getElementById("horario").value = listaGuardada.horario;
actualizarLista();
cargarDatos();
