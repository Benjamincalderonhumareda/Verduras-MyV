import { renderizarCuadricula } from "../renderizador.js";

export const categoria = {
  clave: "chinos",
  archivo: "data/productoschinos.json",
  nombre: "Productos chinos",
  render(contenedor, productos, crearTarjeta) {
    renderizarCuadricula(contenedor, productos, crearTarjeta);
  }
};
