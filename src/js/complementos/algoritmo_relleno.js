/**
 * Clase con algoritmos de relleno.
 */
export default class Relleno {

    /**
     * Funcion para realizar el algoritmo de relleno por frontera.
     * 
     * @param {number} x Coordenada x del pixel.
     * @param {number} y Coordenada y del pinxel.
     * @param {Array<number>} colorRelleno Lista con los componentes rgba del color de relleno.
     * @param {Array<number>} colorFrontera Lista con los componente rgba de la frontera.
     * @param {function} getPixelColor Función para obtener el color de un pixel.
     * @param {function} setPixelColor Función para establecer el color de un pixel.
     */
    frontera(x, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor) {
        if (!x || !y) {
            return;
        }
        const currentColor = getPixelColor(x, y);
        if (currentColor !== colorFrontera && currentColor !== colorRelleno) {
            setPixelColor(x, y, colorRelleno);
            frontera(x + 1, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            frontera(x - 1, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            frontera(x, y + 1, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            frontera(x, y - 1, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
        }
    }

    /**
     * Funcion para realizar el algoritmo de relleno por inundacion.
     * 
     * @param {number} x Coordenada x del pixel.
     * @param {number} y Coordenada y del pinxel.
     * @param {Array<number>} colorRelleno Lista con los componentes rgba del color de relleno.
     * @param {Array<number>} colorObjetivo Lista con los componente rgba del color objetivo.
     * @param {function} getPixelColor Función para obtener el color de un pixel.
     * @param {function} setPixelColor Función para establecer el color de un pixel.
     */
    inundacion(x, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor) {
        if (!x || !y) {
            return;
        }
        const currentColor = getPixelColor(x, y);
        if (currentColor === colorObjetivo && currentColor !== colorRelleno) {
            setPixelColor(x, y, colorRelleno);
            inundacion(x + 1, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            inundacion(x - 1, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            inundacion(x, y + 1, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            inundacion(x, y - 1, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
        }
    }
    
}
