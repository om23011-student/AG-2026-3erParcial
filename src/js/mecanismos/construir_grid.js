import LineaDDA from "../complementos/algoritmo_dda.js";
import transformaciones from "../complementos/algoritmo_transformacion.js";

/**
 * Clase ConstruirGrid
 *
 * Se encarga de la generación estructural del tablero 3D.
 * Fabrica el modelo matemático matriz por matriz y somete las líneas base a las transformaciones
 * de rotación, cizalladura y perspectiva para conseguir un objeto estereoscópico.
 */
export default class ConstruirGrid {
    constructor() {
        this.generadorLineas = new LineaDDA(); // Trazos básicos en planos 2D
        this.transformacion = new transformaciones(); // Cúmulo de transformaciones matriciales
    }

    /**
     * Construye un cubo de 3x3x3 generando las líneas maestras de las bases
     * y calculando los hitboxes matemáticos (min y max) interactivos en pantalla.
     *
     * @returns {Object} Un objeto con el dibujo vectorial del {tablero} y los bounds virtuales {casillas}
     */
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
                const casillasN1 = this.trasladarFiguraNivel(casillaN2, 0);
                const casillasN3 = this.trasladarFiguraNivel(casillaN2, 2);
                
                const casillaData = { x0, x1, y0, y1 }; // Guardar coordenadas originales

                casillas.nivel1[fila].push({
                    xMin: Math.min(casillasN1[0], casillasN1[3]),
                    xMax: Math.max(casillasN1[0], casillasN1[3]),
                    yMin: Math.min(casillasN1[1], casillasN1[4]),
                    yMax: Math.max(casillasN1[1], casillasN1[4]),
                    ...casillaData
                });

                casillas.nivel2[fila].push({
                    xMin: Math.min(casillaN2[0], casillaN2[3]),
                    xMax: Math.max(casillaN2[0], casillaN2[3]),
                    yMin: Math.min(casillaN2[1], casillaN2[4]),
                    yMax: Math.max(casillaN2[1], casillaN2[4]),
                    ...casillaData
                });

                casillas.nivel3[fila].push({
                    xMin: Math.min(casillasN3[0], casillasN3[3]),
                    xMax: Math.max(casillasN3[0], casillasN3[3]),
                    yMin: Math.min(casillasN3[1], casillasN3[4]),
                    yMax: Math.max(casillasN3[1], casillasN3[4]),
                    ...casillaData
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
        const tableroNivel1 = this.trasladarFiguraNivel(tableroNivel2, 0);
        const tableroNivel3 = this.trasladarFiguraNivel(tableroNivel2, 2);
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

    /**
     * Somete cualquier conjunto de vértices crudos a la deformación visual planeada:
     * Traslación espacial 60°, Escalado 0.6, Cizalladura -0.3, Punto de fuga 0.2, Rotación X 70°
     *
     * @param {number[]} array Vertices planos base `[X, Y, Z...]`
     * @returns {number[]} Vector deformado simulando isometría/perspectiva 3D
     */
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

    /**
     * Recibe una figura matemáticamente correcta pero "neutra" y la eleva o la hunde en el eje Y
     * simulando colocar la ficha en el fondo, en el medio o en la cima del cristal.
     *
     * @param {number[]} array Coordenadas de las fichas
     * @param {number} nivel Enum de altura del tablero (0 = Base, 1 = Medio, 2 = Cima)
     * @returns {number[]} Fichas flotando a la altura elegida
     */
    trasladarFiguraNivel(array, nivel) {
        if (nivel === 0) return this.transformacion.translacion(array, 0, -0.6, 0); // Desciende para formar el nivel 1
        if (nivel === 1) return array; // Se queda inalterable para formar el nivel 2 (el del medio)
        if (nivel === 2) return this.transformacion.translacion(array, 0, 0.6, 0); // Asciende para formar el nivel 3
        return array;
    }

}