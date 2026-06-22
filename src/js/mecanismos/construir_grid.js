import LineaDDA from "../complementos/algoritmo_dda.js";
import transformaciones from "../complementos/algoritmo_transformacion.js";

export default class ConstruirGrid {
    constructor() {
        this.generadorLineas = new LineaDDA();
        this.transformacion = new transformaciones();
    }

    obtenerTablero() {
        const lineas = [];
        const casillas = [[],[],[]];

        const min = -0.9;
        const paso = 0.6;
        
        for (let fila = 0; fila < 3; fila++) {
            for (let columna = 0; columna < 3; columna++) {

                const x0 = min + columna * paso;
                const x1 = x0 + paso;

                const y0 = min + fila * paso;
                const y1 = y0 + paso;

                casillas[fila].push({ xMax: x1, yMax: y0, xMin: x0, yMin: y1 });

                lineas.push(
                    ...this.generadorLineas.calcularDDA(x0, y0, x1, y0)
                );

                lineas.push(
                    ...this.generadorLineas.calcularDDA(x1, y0, x1, y1)
                );

                lineas.push(
                    ...this.generadorLineas.calcularDDA(x1, y1, x0, y1)
                );

                lineas.push(
                    ...this.generadorLineas.calcularDDA(x0, y1, x0, y0)
                );

            }
        }
        
        const tableroRotado = this.transformacion.rotacion(lineas, 60); // Rotamos el tablero para darle perspectiva
        const tableroEscalado = this.transformacion.escalado(tableroRotado, 0.6); // Escalamos para que no ocupe toda la pantalla
        const tableroCizallado = this.transformacion.cizalladura(tableroEscalado, -0.3); // Aplicamos cizalladura para simular perspectiva
        const tableroConProfundidad = this.transformacion.puntoFuga(tableroCizallado, 0.2); // Proyectamos para simular profundidad
        
        const gradosInclinacion = 70; 
        const radianesX = gradosInclinacion * (Math.PI / 180);
        const tableroFinal = this.transformacion.rotacionX(tableroConProfundidad, radianesX); // Proyectamos nuevamente para acentuar el efecto de profundidad
        
        return { tablero: tableroFinal, casillas }; // Devolvemos el tablero transformado para que se dibuje con perspectiva y cizalladura
    }
}