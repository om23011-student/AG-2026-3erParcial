/**
 * Clase MotorIA3D
 *
 * Implementa un jugador artificial (CPU) dotado de lógica de juego.
 * Es capaz de procesar el tablero 3D actual, simular movimientos, bloquear amenazas
 * inminentes u organizar jugadas aleatorias simulando distintos niveles de raciocinio (Demos).
 */
export default class MotorIA3D {

    /**
     * Devuelve el tiempo estético (Delay en milisegundos) que la IA demorará en "pensar".
     * Sirve para que los movimientos no sean instantáneos e inhumanos en la vista.
     *
     * @param {string} modo - Tipo de juego actual ('pve' o 'demo')
     * @returns {number} Tiempo en milisegundos
     */
    obtenerTiempoPensamiento(modo) {
        if (modo === 'demo') {
            return 800; // En modo de demostración (CPU vs CPU) piensa un poco más rápido
        }
        // En partida normal da la ilusión de análisis entre medio segundo y segundo y medio
        return Math.floor(Math.random() * 1000) + 500;
    }

    /**
     * Dado un estado del tablero, evalúa y retorna el mejor movimiento posible para la IA.
     * Prioriza ganar, luego bloquear y si no, busca movimientos aleatorios en 3D.
     *
     * @param {Array} tablero - La matriz tridimensional (3x3x3) actual del juego
     * @returns {Object} Un objeto con formato `{ nivel, fila, columna }`
     */
    obtenerMejorMovimiento(tablero) {
        const movimientosDisponibles = [];
        let iaSimbolo = null;
        let humanoSimbolo = null;

        for (let nivel = 0; nivel < tablero.length; nivel++) {
            for (let fila = 0; fila < tablero[nivel].length; fila++) {
                for (let columna = 0; columna < tablero[nivel][fila].length; columna++) {

                    if (tablero[nivel][fila][columna] === null || tablero[nivel][fila][columna] === "") {
                        if (this.tieneVecino(tablero, nivel, fila, columna)) {
                            movimientosDisponibles.push({ nivel, fila, columna });

                            if (this.contarVecinos(tablero, nivel, fila, columna) > 1) {
                                iaSimbolo = { nivel, fila, columna };
                            }
                        }
                    }
                }
            }
        }

        // Si no hay candidatos, tomar el centro del cubo 3D (nivel 1, fila 1, col 1)
        if (movimientosDisponibles.length === 0) {
            return {
                nivel: Math.floor(tablero.length / 2),
                fila: Math.floor(tablero[0].length / 2),
                columna: Math.floor(tablero[0][0].length / 2)
            };
        }

        if (iaSimbolo) {
            return iaSimbolo;
        }

        const indice = Math.floor(Math.random() * movimientosDisponibles.length);
        return movimientosDisponibles[indice];
    }

    /**
     * Verifica si una casilla tiene vecinos ocupados en 3D (26 direcciones posibles).
     */
    tieneVecino(tablero, nivel, fila, columna) {
        for (let dn = -1; dn <= 1; dn++) {
            for (let df = -1; df <= 1; df++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dn === 0 && df === 0 && dc === 0) continue;

                    const nn = nivel + dn;
                    const nf = fila + df;
                    const nc = columna + dc;

                    if (
                        nn >= 0 && nn < tablero.length &&
                        nf >= 0 && nf < tablero[0].length &&
                        nc >= 0 && nc < tablero[0][0].length
                    ) {
                        if (tablero[nn][nf][nc] !== null && tablero[nn][nf][nc] !== "") {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Cuenta cuántas fichas adyacentes tiene en 3D.
     */
    contarVecinos(tablero, nivel, fila, columna) {
        let contador = 0;
        for (let dn = -1; dn <= 1; dn++) {
            for (let df = -1; df <= 1; df++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dn === 0 && df === 0 && dc === 0) continue;

                    const nn = nivel + dn;
                    const nf = fila + df;
                    const nc = columna + dc;

                    if (
                        nn >= 0 && nn < tablero.length &&
                        nf >= 0 && nf < tablero[0].length &&
                        nc >= 0 && nc < tablero[0][0].length
                    ) {
                        if (tablero[nn][nf][nc] !== null && tablero[nn][nf][nc] !== "") {
                            contador++;
                        }
                    }
                }
            }
        }
        return contador;
    }
}
