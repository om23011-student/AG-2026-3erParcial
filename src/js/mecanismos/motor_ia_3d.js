export default class MotorIA3D {
    /**
     * Evalúa el tablero 3D actual y decide la mejor jugada posible.
     * Busca una casilla vacía que tenga vecinos ocupados en las 26 direcciones posibles.
     * @param {Array} tablero - Matriz tridimensional (nivel, fila, columna).
     * @returns {Object} Un objeto con {nivel, fila, columna} de la jugada elegida.
     */
    obtenerMejorMovimiento(tablero) {
        const candidatos = [];
        const candidatosDefensivos = [];

        for (let nivel = 0; nivel < tablero.length; nivel++) {
            for (let fila = 0; fila < tablero[nivel].length; fila++) {
                for (let columna = 0; columna < tablero[nivel][fila].length; columna++) {

                    if (tablero[nivel][fila][columna] === null || tablero[nivel][fila][columna] === "") {
                        if (this.tieneVecino(tablero, nivel, fila, columna)) {
                            candidatos.push({ nivel, fila, columna });

                            if (this.contarVecinos(tablero, nivel, fila, columna) > 1) {
                                candidatosDefensivos.push({ nivel, fila, columna });
                            }
                        }
                    }
                }
            }
        }

        // Si no hay candidatos, tomar el centro del cubo 3D (nivel 1, fila 1, col 1)
        if (candidatos.length === 0) {
            return {
                nivel: Math.floor(tablero.length / 2),
                fila: Math.floor(tablero[0].length / 2),
                columna: Math.floor(tablero[0][0].length / 2)
            };
        }

        if (candidatosDefensivos.length > 0) {
            const indiceDefensivo = Math.floor(Math.random() * candidatosDefensivos.length);
            return candidatosDefensivos[indiceDefensivo];
        }

        const indice = Math.floor(Math.random() * candidatos.length);
        return candidatos[indice];
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

    /**
     * Tiempo de espera aleatorio para que parezca una decisión.
     */
    obtenerTiempoPensamiento(modo) {
        if (modo === 'demo' || modo === 'eve') {
            return Math.floor(Math.random() * 1000) + 600;
        }
        return Math.floor(Math.random() * 1000) + 600;
    }
}

