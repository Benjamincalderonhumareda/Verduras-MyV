import { renderizarCuadricula } from "../renderizador.js";

export const categoria = {
  clave: "hortalizas",
  archivo: "data/hortalizas.json",
  nombre: "Hortalizas",
  render(contenedor, productos, crearTarjeta) {
    renderizarCuadricula(contenedor, productos, crearTarjeta);
  }
};
