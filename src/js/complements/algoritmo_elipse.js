// algoritmo_elipse.js
export default class AlgoritmoElipse {
    
    // --- Algoritmo original para la Elipse ---
    calcularElipse(xc, yc, rx, ry, resolucion = 100) {
        const puntos = [];

        // 1. Convertimos todo a "enteros" (espacio de píxeles)
        let xcInt = Math.round(xc * resolucion);
        let ycInt = Math.round(yc * resolucion);
        let rxInt = Math.round(rx * resolucion);
        let ryInt = Math.round(ry * resolucion);

        const rx2 = rxInt * rxInt;
        const ry2 = ryInt * ryInt;

        let x = 0;
        let y = ryInt;

        let dx = 2 * ry2 * x;
        let dy = 2 * rx2 * y;

        let p1 = ry2 - (rx2 * ryInt) + (0.25 * rx2);

        // 2. Al hacer el push, devolvemos los puntos al espacio flotante de WebGL
        const agregarSimetria = (px, py) => {
            puntos.push((xcInt + px) / resolucion, (ycInt + py) / resolucion, 0.0);
            puntos.push((xcInt - px) / resolucion, (ycInt + py) / resolucion, 0.0);
            puntos.push((xcInt + px) / resolucion, (ycInt - py) / resolucion, 0.0);
            puntos.push((xcInt - px) / resolucion, (ycInt - py) / resolucion, 0.0);
        };

        // --- REGIÓN 1 ---
        while (dx < dy) {
            agregarSimetria(x, y);

            if (p1 < 0) {
                x++;
                dx = dx + (2 * ry2);
                p1 = p1 + dx + ry2;
            } else {
                x++;
                y--;
                dx = dx + (2 * ry2);
                dy = dy - (2 * rx2);
                p1 = p1 + dx - dy + ry2;
            }
        }

        // --- REGIÓN 2 ---
        let p2 = (ry2 * ((x + 0.5) * (x + 0.5))) + (rx2 * ((y - 1) * (y - 1))) - (rx2 * rx2);

        while (y >= 0) {
            agregarSimetria(x, y);

            if (p2 > 0) {
                y--;
                dy = dy - (2 * rx2);
                p2 = p2 - dy + rx2;
            } else {
                x++;
                y--;
                dx = dx + (2 * ry2);
                dy = dy - (2 * rx2);
                p2 = p2 + dx - dy + rx2;
            }
        }

        return puntos;
    }

    
    calcularCirculo(xc, yc, r, octants = [0, 1, 2, 3, 4, 5, 6, 7], resolucion = 100) {
        const puntos = [];

        // Validaciones iniciales
        if (r < 0 || octants.length > 8) {
            return puntos;
        }

        // 1. Convertimos a espacio de enteros escalados según la resolución
        let xcInt = Math.round(xc * resolucion);
        let ycInt = Math.round(yc * resolucion);
        let rInt = Math.round(r * resolucion);

        // Caso especial: si el radio es 0, solo dibujamos el centro
        if (rInt === 0) {
            puntos.push(xcInt / resolucion, ycInt / resolucion, 0.0);
            return puntos;
        }

        let x = 0;
        let y = rInt;
        let d = 1 - rInt;

        // 2. Función interna para devolver puntos a flotantes WebGL 
        // e iterar sobre los octantes seleccionados
        const agregarOctantes = (px, py) => {
            for (let oct of octants) {
                switch (oct) {
                    case 0: puntos.push((xcInt + px) / resolucion, (ycInt - py) / resolucion, 0.0); break;
                    case 1: puntos.push((xcInt + py) / resolucion, (ycInt - px) / resolucion, 0.0); break;
                    case 2: puntos.push((xcInt - py) / resolucion, (ycInt - px) / resolucion, 0.0); break;
                    case 3: puntos.push((xcInt - px) / resolucion, (ycInt - py) / resolucion, 0.0); break;
                    case 4: puntos.push((xcInt - px) / resolucion, (ycInt + py) / resolucion, 0.0); break;
                    case 5: puntos.push((xcInt - py) / resolucion, (ycInt + px) / resolucion, 0.0); break;
                    case 6: puntos.push((xcInt + py) / resolucion, (ycInt + px) / resolucion, 0.0); break;
                    case 7: puntos.push((xcInt + px) / resolucion, (ycInt + py) / resolucion, 0.0); break;
                }
            }
        };

        // 3. Ciclo principal del algoritmo Punto Medio
        while (x <= y) {
            agregarOctantes(x, y);
            x++;
            
            if (d < 0) {
                d += 2 * x + 1;
            } else {
                y--;
                d += 2 * (x - y) + 1;
            }
        }

        return puntos;
    }


    /**
     * Genera los vértices (x, y, z) de un círculo usando el algoritmo de Bresenham.
     * @param {number} cx - Coordenada X del centro (ej. -1.0 a 1.0)
     * @param {number} cy - Coordenada Y del centro
     * @param {number} radio - Radio del círculo
     * @returns {Array} - Arreglo unidimensional con los datos de los vértices [x1, y1, z1, x2, y2, z2, ...]
     */
    circuloBresenham(cx, cy, radio) {
        const puntos = [];
        const scale = 100; 

        // Convertimos a enteros para el algoritmo
        const cx0 = Math.round(cx * scale);
        const cy0 = Math.round(cy * scale);
        const r = Math.round(radio * scale);

        // Caso base: círculo sin radio
        if (r <= 0) {
            puntos.push(cx, cy, 0.0);
            return puntos;
        }

        // Función interna para devolver las coordenadas a la escala WebGL y añadir Z = 0.0
        const plot = (px, py) => {
            puntos.push(px / scale, py / scale, 0.0); 
        };

        // Simetría de 8 octantes
        const plotOctantes = (x, y) => {
            plot(cx0 + x, cy0 + y);
            plot(cx0 - x, cy0 + y);
            plot(cx0 + x, cy0 - y);
            plot(cx0 - x, cy0 - y);
            plot(cx0 + y, cy0 + x);
            plot(cx0 - y, cy0 + x);
            plot(cx0 + y, cy0 - x);
            plot(cx0 - y, cy0 - x);
        };

        // Valores iniciales
        let x = 0;
        let y = r;
        let d = 3 - 2 * r;

        plotOctantes(x, y);

        // Ciclo principal
        while (x < y) {
            x++;
            if (d > 0) {
                y--;
                d += 4 * (x - y) + 10;
            } else {
                d += 4 * x + 6;
            }
            plotOctantes(x, y);
        }

        return puntos;
    }
}


