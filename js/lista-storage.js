const CLAVE = "verduras-myv:lista:v1";

export function leerListaGuardada(almacenamiento) {
  try {
    const texto = (almacenamiento ?? window.localStorage).getItem(CLAVE);
    if (!texto) return { productos: [], horario: "", error: false };
    const datos = JSON.parse(texto);
    const productos = Array.isArray(datos?.productos) ? datos.productos.filter(item =>
      item && typeof item.nombre === "string" && item.nombre.trim() &&
      Number.isFinite(item.cantidad) && item.cantidad > 0 &&
      (item.tipo === "kg" || (item.tipo === "unidad" && Number.isInteger(item.cantidad)))
    ).map(({ nombre, cantidad, tipo }) => ({ nombre, cantidad, tipo })) : [];
    return { productos, horario: typeof datos?.horario === "string" ? datos.horario : "", error: false };
  } catch {
    return { productos: [], horario: "", error: true };
  }
}

export function guardarLista(productos, horario, almacenamiento) {
  try {
    (almacenamiento ?? window.localStorage).setItem(CLAVE, JSON.stringify({ productos, horario }));
    return true;
  } catch {
    return false;
  }
}
