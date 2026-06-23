export default class GestorInput {
    /**
     * Se encarga de abstraer todos los eventos del mouse sobre el Canvas,
     * normalizar las coordenadas al espacio WebGL, y buscar colisiones
     * matemáticas contra la matriz interactiva de casillas.
     */
    constructor(canvas, casillas, callbacks) {
        this.canvas = canvas;
        this.casillas = casillas;
        this.onClick = callbacks.onClick;
        this.onHover = callbacks.onHover;

        this._enlazarEventos();
    }

    _obtenerCoordenadasNormalizadas(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Obtener pixel real dentro del Canvas
        const x = parseInt((e.clientX - rect.left) * (this.canvas.width / rect.width));
        const y = parseInt((e.clientY - rect.top) * (this.canvas.height / rect.height));

        // Normalizar a [-1, 1] que es lo que WebGL y nuestras matemáticas de casillas entienden
        const xNorm = (x / this.canvas.width) * 2 - 1;
        const yNorm = -((y / this.canvas.height) * 2 - 1);
        return { xNorm, yNorm };
    }

    _buscarCasillaConColision(xNorm, yNorm) {
        let encontrada = null;
        Object.values(this.casillas).forEach((nivel, nivelIdx) => {
            nivel.forEach((fila, filaIdx) => {
                fila.forEach((casilla, columnaIdx) => {
                    if (xNorm >= casilla.xMin && xNorm <= casilla.xMax && yNorm >= casilla.yMin && yNorm <= casilla.yMax) {
                        encontrada = { nivelIdx, filaIdx, columnaIdx, casilla };
                    }
                });
            });
        });
        return encontrada;
    }

    _enlazarEventos() {
        // Escuchar clic principal
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Solo clic izquierdo
            const { xNorm, yNorm } = this._obtenerCoordenadasNormalizadas(e);
            const celda = this._buscarCasillaConColision(xNorm, yNorm);

            if (celda && this.onClick) {
                this.onClick(celda);
            }
        });

        // Escuchar movimiento del ratón
        this.canvas.addEventListener('mousemove', (e) => {
            const { xNorm, yNorm } = this._obtenerCoordenadasNormalizadas(e);
            const celda = this._buscarCasillaConColision(xNorm, yNorm);

            if (this.onHover) {
                this.onHover(celda);
            }
        });

        // Apagar resaltado si el ratón abandona el área del Canvas
        this.canvas.addEventListener('mouseleave', () => {
            if (this.onHover) {
                this.onHover(null);
            }
        });
    }
}
