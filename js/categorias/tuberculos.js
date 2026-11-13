import { renderizarFilasHorizontales } from "../renderizador.js";

export const categoria = {
  clave: "tuberculos",
  archivo: "data/tuberculos.json",
  nombre: "Tub\u00e9rculos",
  grupos: [
    { clave: "papas", nombre: "Papas" },
    { clave: "camotes", nombre: "Camotes" },
    { clave: "yucas", nombre: "Yucas" },
    { clave: "ollucos", nombre: "Ollucos" }
  ],
  render(contenedor, productos, crearTarjeta) {
    renderizarFilasHorizontales(contenedor, productos, this.grupos, crearTarjeta);
  }
};
