import LineaDDA from "../complementos/algoritmo_dda.js";
import Transformaciones from "../complementos/algoritmo_transformacion.js";

export default class ConstruirGrid {
    constructor() {
        this.generadorLineas = new LineaDDA();
        this.transformacion = new Transformaciones();
    }

    obtenerTablero() {
        const lineas = [];
        // Construimos un tablero de 3x3 usando líneas horizontales y verticales
        for (let i = -0.54; i <= 0.54; i += 0.36) {
            // Líneas horizontales
            lineas.push(...this.generadorLineas.calcularDDA(-0.54, i, 0.54, i));
            // Líneas verticales
            lineas.push(...this.generadorLineas.calcularDDA(i, -0.54, i, 0.54));
        }


        const tableroRotado = this.transformacion.rotacion(lineas, 60); // Rotamos el tablero para darle perspectiva
        const tableroCizallado = this.transformacion.cizalladura(tableroRotado, -0.3); // Aplicamos cizalladura para simular perspectiva
        const tableroConProfundidad = this.transformacion.puntoFuga(tableroCizallado, 0.2); // Proyectamos para simular profundidad

        const gradosInclinacion = 70; 
        const radianesX = gradosInclinacion * (Math.PI / 180);
        const tableroFinal = this.transformacion.rotacionX(tableroConProfundidad, radianesX); // Proyectamos nuevamente para acentuar el efecto de profundidad
        return tableroFinal; // Devolvemos el tablero transformado para que se dibuje con perspectiva y cizalladura
    }


    obtenerCentros() {
    const centrosCasillas = [
        -0.36, -0.36, 0.00,
         0.00, -0.36, 0.00,
         0.36, -0.36, 0.00,

        -0.36,  0.00, 0.00,
         0.00,  0.00, 0.00,
         0.36,  0.00, 0.00,

        -0.36,  0.36, 0.00,
         0.00,  0.36, 0.00,
         0.36,  0.36, 0.00
    ];

    const centrosRotado = this.transformacion.rotacion(centrosCasillas, 60);
    const centrosCizallado = this.transformacion.cizalladura(centrosRotado, -0.3);
    const centrosConProfundidad = this.transformacion.puntoFuga(centrosCizallado, 0.2);

    const gradosInclinacion = 70;
    const radianesX = gradosInclinacion * (Math.PI / 180);

    const centrosFinal = this.transformacion.rotacionX(
        centrosConProfundidad,
        radianesX
    );

    const factor = 10000; // 5 decimales

    return centrosFinal.map(valor =>
        Math.trunc(valor * factor) / factor
    );
}
}