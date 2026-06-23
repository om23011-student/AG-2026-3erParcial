/**
 * Clase con algoritmos de relleno corregidos.
 */
export default class Relleno {

    // Función auxiliar para comparar arreglos de color [r,g,b,a]
    _mismoColor(c1, c2) {
        if (!c1 || !c2) return false;
        return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
    }

    /**
     * Algoritmo de relleno por frontera.
     */
    frontera(x, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor) {
        // Validamos que existan las coordenadas (permitiendo el 0)
        if (x === undefined || y === undefined) return;

        const currentColor = getPixelColor(x, y);

        // Si no es la frontera y no ha sido rellenado aún
        if (!this._mismoColor(currentColor, colorFrontera) && !this._mismoColor(currentColor, colorRelleno)) {
            setPixelColor(x, y, colorRelleno);
            
            // Corrección: Usar 'this.' para la recursión
            this.frontera(x + 1, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            this.frontera(x - 1, y, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            this.frontera(x, y + 1, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
            this.frontera(x, y - 1, colorRelleno, colorFrontera, getPixelColor, setPixelColor);
        }
    }

    /**
     * Algoritmo de relleno por inundación.
     */
    inundacion(x, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor) {
        if (x === undefined || y === undefined) return;

        const currentColor = getPixelColor(x, y);

        // Si es igual al color de fondo/objetivo que queremos cambiar
        if (this._mismoColor(currentColor, colorObjetivo) && !this._mismoColor(currentColor, colorRelleno)) {
            setPixelColor(x, y, colorRelleno);
            
            // Corrección: Usar 'this.' para la recursión
            this.inundacion(x + 1, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            this.inundacion(x - 1, y, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            this.inundacion(x, y + 1, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
            this.inundacion(x, y - 1, colorRelleno, colorObjetivo, getPixelColor, setPixelColor);
        }
    }

    barridoLineal(xMin, xMax, yMin, yMax, generadorLineas, paso = 0.01) {
        const puntosRelleno = [];

        // Barremos verticalmente desde el fondo hasta el tope del relieve
        for (let yActual = yMin; yActual <= yMax; yActual += paso) {
            
            // Generamos una línea horizontal paralela en la altura actual
            const lineaHorizontal = generadorLineas.calcularDDA(xMin, yActual, xMax, yActual);
            
            // Acumulamos los vértices generados
            puntosRelleno.push(...lineaHorizontal);
        }

        return puntosRelleno;
    }


    /**
     * Genera el relleno por barrido lineal para una corona circular (anillo).
     * * @param {number} cx Centro X del círculo.
     * @param {number} cy Centro Y del círculo.
     * @param {number} rMax Radio exterior.
     * @param {number} rMin Radio interior.
     * @param {Object} generadorLineas Instancia de LineaDDA para trazar los segmentos.
     * @param {number} paso Distancia vertical entre cada línea paralela.
     * @returns {number[]} Array de puntos vectoriales del relleno.
     */
    barridoCircular(cx, cy, rMax, rMin, generadorLineas, paso = 0.01) {
        const puntosRelleno = [];

        // Recorremos verticalmente desde el fondo del círculo exterior hasta el tope
        for (let yRel = -rMax; yRel <= rMax; yRel += paso) {
            const yActual = cy + yRel;

            // 1. Calcular intersecciones con el círculo EXTERIOR usando Pitágoras
            const dexfuera = Math.sqrt(rMax * rMax - yRel * yRel);
            const xExtIzquierda = cx - dexfuera;
            const xExtDerecha = cx + dexfuera;

            // 2. Verificar si la línea horizontal actual corta también al círculo INTERIOR
            if (Math.abs(yRel) < rMin) {
                const dexDentro = Math.sqrt(rMin * rMin - yRel * yRel);
                const xIntIzquierda = cx - dexDentro;
                const xIntDerecha = cx + dexDentro;

                // Al haber hueco, dibujamos DOS segmentos separados a los lados:
                // Segmento izquierdo: desde el borde exterior izquierdo al borde interior izquierdo
                puntosRelleno.push(...generadorLineas.calcularDDA(xExtIzquierda, yActual, xIntIzquierda, yActual));
                // Segmento derecho: desde el borde interior derecho al borde exterior derecho
                puntosRelleno.push(...generadorLineas.calcularDDA(xIntDerecha, yActual, xExtDerecha, yActual));
            } else {
                // Si está por encima o por debajo del hueco interior, es una línea sólida de lado a lado
                puntosRelleno.push(...generadorLineas.calcularDDA(xExtIzquierda, yActual, xExtDerecha, yActual));
            }
        }

        return puntosRelleno;
    }
}
