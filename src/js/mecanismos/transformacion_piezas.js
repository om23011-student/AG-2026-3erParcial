import transformaciones from "../complementos/algoritmo_transformacion.js";

export default class TransformacionPiezas{
    constructor() {
        this.transformacion = new transformaciones();
    }

    aplicarTransformaciones(piezas){
        const piezasRotadas = this.transformacion.rotacion(piezas, 60); // Rotamos el tablero para darle perspectiva
        const piezaEscalada = this.transformacion.escalado(piezasRotadas, 0.6); // Escalamos para que no ocupe toda la pantalla
        const tableroCizallado = this.transformacion.cizalladura(piezaEscalada, -0.3); // Aplicamos cizalladura para simular perspectiva
        const piezaConProfundidad = this.transformacion.puntoFuga(tableroCizallado, 0.2); // Proyectamos para simular profundidad
        
        const gradosInclinacion = 70; 
        const radianesX = gradosInclinacion * (Math.PI / 180);
        const piezaFinal = this.transformacion.rotacionX(piezaConProfundidad, radianesX); // Proyectamos nuevamente para acentuar el efecto de profundidad
        
        return piezaFinal; // Devolvemos el tablero transformado para que se dibuje con perspectiva y cizalladura
    }
}