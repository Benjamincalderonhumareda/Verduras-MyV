import { renderizarFilasHorizontales } from "../renderizador.js";

export const categoria = {
  clave: "verduras",
  archivo: "data/verduras.json",
  nombre: "Verduras",
  grupos: [
    { clave: "granos", nombre: "Granos" },
    { clave: "plantas-raiz", nombre: "Plantas ra\u00edz" },
    { clave: "lechugas", nombre: "Lechugas" },
    { clave: "col", nombre: "Col" }
  ],
  render(contenedor, productos, crearTarjeta) {
    renderizarFilasHorizontales(contenedor, productos, this.grupos, crearTarjeta);
  }
};
