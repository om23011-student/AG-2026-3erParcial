import LineaDDA from '../complementos/algoritmo_dda.js';
import AlgoritmoElipse from '../complementos/algoritmos_bresenham.js';

/**
 * Clase GraficadorEscena
 *
 * Abstrae y centraliza toda la responsabilidad de producir la visualización matemática.
 * Convierte planos 2D perfectos (líneas DDA, Círculos Bresenham) en coordenadas transformadas
 * en un espacio 3D simulado asistiéndose de la matriz Constructora de Grid.
 */
export default class GraficadorEscena {
    /**
     * @param {ConstruirGrid} constructorGrid - Referencia al motor que modela la perspectiva del entorno.
     */
    constructor(constructorGrid) {
        this.generadorLineas = new LineaDDA();       // Instancia para dibujar primitivas de líneas rectas
        this.generadorElipse = new AlgoritmoElipse(); // Instancia para dibujar arcos y círculos (ficha O)
        this.grid = constructorGrid; // Referencia central a la matriz de perspectiva
    }

    /**
     * Genera la topología de una Ficha "X"
     * @param {Object} casilla Casilla plana donde irá insertada
     * @param {number} nivel Índice de la altura Z
     * @returns {number[]} Array de vértices tridimensionales para insertar al Buffer
     */
    crearFichaX(casilla, nivel) {
        const forma = [];
        const padding = 0.15; // Margen dinámico que separa los bordes de la ficha respecto de la casilla
        const xMinOriginal = casilla.x0 + padding;
        const xMaxOriginal = casilla.x1 - padding;
        const yMinOriginal = casilla.y0 + padding;
        const yMaxOriginal = casilla.y1 - padding;

        const linea1 = this.generadorLineas.calcularDDA(xMinOriginal, yMinOriginal, xMaxOriginal, yMaxOriginal);
        const linea2 = this.generadorLineas.calcularDDA(xMaxOriginal, yMinOriginal, xMinOriginal, yMaxOriginal);

        forma.push(...this.grid.trasladarFiguraNivel(this.grid.transformarFigura(linea1), nivel));
        forma.push(...this.grid.trasladarFiguraNivel(this.grid.transformarFigura(linea2), nivel));

        return forma;
    }

    /**
     * Genera la topología de una Ficha "O"
     * @param {Object} casilla Casilla plana donde irá insertada
     * @param {number} nivel Índice de la altura Z
     * @returns {number[]} Array de vértices tridimensionales para el buffer de WebGL
     */
    crearFichaO(casilla, nivel) {
        const forma = [];
        const padding = 0.15; // Margen dinámico que separa los bordes de la ficha respecto de la casilla
        const xMinOriginal = casilla.x0 + padding;
        const xMaxOriginal = casilla.x1 - padding;
        const yMinOriginal = casilla.y0 + padding;
        const yMaxOriginal = casilla.y1 - padding;

        const x = (xMinOriginal + xMaxOriginal) / 2;
        const y = (yMinOriginal + yMaxOriginal) / 2;
        const radio = Math.min(xMaxOriginal - xMinOriginal, yMaxOriginal - yMinOriginal) / 2;

        const circulo1 = this.generadorElipse.calcularCirculo(x, y, radio);
        const circulo2 = this.generadorElipse.calcularCirculo(x, y, radio * 0.8);

        forma.push(...this.grid.trasladarFiguraNivel(this.grid.transformarFigura(circulo1), nivel));
        forma.push(...this.grid.trasladarFiguraNivel(this.grid.transformarFigura(circulo2), nivel));

        return forma;
    }

    /**
     * Genera un marco perimetral plano dentro de la casilla seleccionada por el Mouse (Efecto Hover)
     * @param {Object} casilla Coordenadas de la casilla en bruto
     * @param {number} nivel Piso o nivel (Z) al que pertenece
     * @returns {number[]} Vector espacial procesado para el hover
     */
    crearResaltado(casilla, nivel) {
        const forma = [];
        const x0 = casilla.x0;
        const x1 = casilla.x1;
        const y0 = casilla.y0;
        const y1 = casilla.y1;

        const hp = 0.05;
        const base1 = this.generadorLineas.calcularDDA(x0 + hp, y0 + hp, x1 - hp, y0 + hp);
        const base2 = this.generadorLineas.calcularDDA(x1 - hp, y0 + hp, x1 - hp, y1 - hp);
        const base3 = this.generadorLineas.calcularDDA(x1 - hp, y1 - hp, x0 + hp, y1 - hp);
        const base4 = this.generadorLineas.calcularDDA(x0 + hp, y1 - hp, x0 + hp, y0 + hp);

        const procesar = (linea) => this.grid.trasladarFiguraNivel(this.grid.transformarFigura(linea), nivel);

        forma.push(...procesar(base1));
        forma.push(...procesar(base2));
        forma.push(...procesar(base3));
        forma.push(...procesar(base4));

        return forma;
    }

    /**
     * Diseña y transforma la línea rectilínea que atraviesa un "Tic-Tac-Toe" cuando alguien gana.
     * Analiza si la victoria es horizontal/2D o si requiere un cruce de planos (Diagonal 3D).
     * @param {Object} resultado Datos extraídos por el Validador lógico `detectorGanador`
     * @param {Object} casillas Mapeo de la memoria del tablero
     * @returns {number[]} Array con los puntos de toda la recta generada
     */
    crearLineaVictoria(resultado, casillas) {
        const lineaGanadora = [];
        const { coordenadaInicio, vectorVictoria } = resultado;
        const [dz, dy, dx] = vectorVictoria;

        // C1 es la casilla origen donde inició la combinación de victoria
        const c1 = casillas[`nivel${coordenadaInicio.nivel + 1}`][coordenadaInicio.fila][coordenadaInicio.columna];
        const xInicio = (c1.x0 + c1.x1) / 2;
        const yInicio = (c1.y0 + c1.y1) / 2;

        // C3 es la casilla final del cruce de planos
        const nivelFin = coordenadaInicio.nivel + (dz * 2);
        const filaFin = coordenadaInicio.fila + (dy * 2);
        const colFin = coordenadaInicio.columna + (dx * 2);
        const c3 = casillas[`nivel${nivelFin + 1}`][filaFin][colFin];
        const xFin = (c3.x0 + c3.x1) / 2;
        const yFin = (c3.y0 + c3.y1) / 2;

        const linea = this.generadorLineas.calcularDDA(xInicio, yInicio, xFin, yFin);

        if (dz === 0) {
            // Si la victoria ocurrió netamente en la misma altura, se calcula 2D y sube.
            let trazoTranformado = this.grid.transformarFigura(linea);
            lineaGanadora.push(...this.grid.trasladarFiguraNivel(trazoTranformado, coordenadaInicio.nivel));
        } else {
            // Cuando la victoria rompe el factor Z (Caída), se tiran rayos DDA desde una perspectiva netamente 3D preprocesada
            let pc1 = this.grid.trasladarFiguraNivel(this.grid.transformarFigura([xInicio, yInicio, 0.0]), coordenadaInicio.nivel);
            let pc3 = this.grid.trasladarFiguraNivel(this.grid.transformarFigura([xFin, yFin, 0.0]), nivelFin);

            const pxInicio = pc1[0], pyInicio = pc1[1];
            const pxFin = pc3[0], pyFin = pc3[1];

            const dxPixel = pxFin - pxInicio;
            const dyPixel = pyFin - pyInicio;
            const pasos = Math.max(Math.abs(dxPixel), Math.abs(dyPixel)) * 100;
            const xInc = dxPixel / pasos;
            const yInc = dyPixel / pasos;

            let pX = pxInicio, pY = pyInicio;
            for(let i = 0; i <= pasos; i++) {
                lineaGanadora.push(pX, pY, 0.0);
                pX += xInc;
                pY += yInc;
            }
        }
        return lineaGanadora;
    }

    /**
     * Construye estáticamente algunas rayas accesorias que adornan visualmente la "Caja" del juego.
     * @returns {number[]} Trama con estelas decorativas para el render persistente
     */
    crearDecoracion() {
        const decoracion = [];
        decoracion.push(...this.generadorLineas.calcularDDA(-0.74, -0.49, -0.74, 0.71));
        decoracion.push(...this.generadorLineas.calcularDDA(0.85, -0.72, 0.85, 0.47));
        decoracion.push(...this.generadorLineas.calcularDDA(-0.16, 0.32, -0.16, -0.87));
        decoracion.push(...this.generadorLineas.calcularDDA(0.12, 0.37, 0.12, 0.21));
        decoracion.push(...this.generadorLineas.calcularDDA(0.12, -0.24, 0.12, -0.39));
        return decoracion;
    }
}
