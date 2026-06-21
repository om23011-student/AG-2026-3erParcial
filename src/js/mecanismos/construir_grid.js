import LineaDDA from "../complementos/algoritmo_dda.js";
import transformaciones from "../complementos/algoritmo_transformacion.js";

export default class ConstruirGrid {
    constructor() {
        this.generadorLineas = new LineaDDA();
        this.transformacion = new transformaciones();
    }

    obtenerTablero() {
        const lineas = [];
        // Construimos un tablero de 3x3 usando líneas horizontales y verticales
        for (let i = -0.9; i <= 0.9; i += 0.6) {
            // Líneas horizontales
            lineas.push(...this.generadorLineas.calcularDDA(-0.9, i, 0.9, i));
            // Líneas verticales
            lineas.push(...this.generadorLineas.calcularDDA(i, -0.9, i, 0.9));
        }
        
        const tableroRotado = this.transformacion.rotacion(lineas, 60); // Rotamos el tablero para darle perspectiva
        const tableroEscalado = this.transformacion.escalado(tableroRotado, 0.6); // Escalamos para que no ocupe toda la pantalla
        const tableroCizallado = this.transformacion.cizalladura(tableroEscalado, -0.3); // Aplicamos cizalladura para simular perspectiva
        const tableroConProfundidad = this.transformacion.puntoFuga(tableroCizallado, 0.2); // Proyectamos para simular profundidad
        
        const gradosInclinacion = 70; 
        const radianesX = gradosInclinacion * (Math.PI / 180);
        const tableroFinal = this.transformacion.rotacionX(tableroConProfundidad, radianesX); // Proyectamos nuevamente para acentuar el efecto de profundidad
        
        return tableroFinal; // Devolvemos el tablero transformado para que se dibuje con perspectiva y cizalladura
    }
}