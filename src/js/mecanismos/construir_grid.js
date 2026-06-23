import LineaDDA from "../complementos/algoritmo_dda.js";
import transformaciones from "../complementos/algoritmo_transformacion.js";

export default class ConstruirGrid {
    constructor() {
        this.generadorLineas = new LineaDDA();
        this.transformacion = new transformaciones();
    }

    obtenerTablero() {
        const lineas = [];
        const casillas = {
            nivel1: [[], [], []],
            nivel2: [[], [], []],
            nivel3: [[], [], []]
        }

        const min = -0.9;
        const paso = 0.6;
        
        for (let fila = 0; fila < 3; fila++) {
            for (let columna = 0; columna < 3; columna++) {

                const x0 = min + columna * paso;
                const x1 = x0 + paso;

                const y0 = min + fila * paso;
                const y1 = y0 + paso;

                const casillaN2 = this.transformarArray([x0, y0, 0, x1, y1, 0]);
                const casillasN1 = this.transformacion.translacion(casillaN2, 0, -0.6, 0);
                const casillasN3 = this.transformacion.translacion(casillaN2, 0, 0.6, 0);
                
                casillas.nivel1[fila].push({
                    xMin: Math.min(casillasN1[0], casillasN1[3]),
                    xMax: Math.max(casillasN1[0], casillasN1[3]),
                    yMin: Math.min(casillasN1[1], casillasN1[4]),
                    yMax: Math.max(casillasN1[1], casillasN1[4])
                });

                casillas.nivel2[fila].push({
                    xMin: Math.min(casillaN2[0], casillaN2[3]),
                    xMax: Math.max(casillaN2[0], casillaN2[3]),
                    yMin: Math.min(casillaN2[1], casillaN2[4]),
                    yMax: Math.max(casillaN2[1], casillaN2[4])
                });

                casillas.nivel3[fila].push({
                    xMin: Math.min(casillasN3[0], casillasN3[3]),
                    xMax: Math.max(casillasN3[0], casillasN3[3]),
                    yMin: Math.min(casillasN3[1], casillasN3[4]),
                    yMax: Math.max(casillasN3[1], casillasN3[4])
                });

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
        const tableroNivel2 = this.transformarArray(lineas);
        const tableroNivel1 = this.transformacion.translacion(tableroNivel2, 0, -0.6, 0);
        const tableroNivel3 = this.transformacion.translacion(tableroNivel2, 0, 0.6, 0);
        const tablero = {
            n1: tableroNivel1,
            n2: tableroNivel2,
            n3: tableroNivel3
        };
        return { 
            tablero,
            casillas
        };
    }

    transformarArray(array) {
        let resultado = this.transformacion.rotacion(array, 60);
        resultado = this.transformacion.escalado(resultado, 0.6);
        resultado = this.transformacion.cizalladura(resultado, -0.3);
        resultado = this.transformacion.puntoFuga(resultado, 0.2);
        const gradosInclinacion = 70; 
        const radianesX = gradosInclinacion * (Math.PI / 180);
        resultado = this.transformacion.rotacionX(resultado, radianesX);
        return resultado;
    }

    transformarFigura(array) {
        let resultado = this.transformacion.rotacion(array,  (Math.PI / 180));
        // resultado = this.transformacion.escalado(resultado, 0.6);
        return resultado;
    }

    trasladarFigura(array, altura= 1) {
        // const resultado = this.transformacion.translacion(array, 0, -0.6, 0);
        const resultado = this.transformacion.translacion(array, 0, 0.6, 0);
        return resultado;
    }
}