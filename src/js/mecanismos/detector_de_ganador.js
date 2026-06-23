/**
 * Clase TresEnRaya3D
 *
 * Implementa el gestor de memoria lógica y el algoritmo de arbitraje del juego.
 * Gestiona el cubo de 3x3x3, almacena las fichas X y O e interroga las combinaciones
 * matemáticas para detectar empates o posibles líneas ganadoras (en 2D o profundidades 3D).
 */
export default class TresEnRaya3D {

    constructor() {
        this.tablero = [];
        this.iniciarJuego(); // Inicializa la matriz 3x3x3
    }

    /**
     * Resetea el cubo lógico y lo llena de posiciones vacías (null).
     */
    iniciarJuego() {
        this.tablero = [];
        
        // Creamos 3 niveles (Z)
        for (let z = 0; z < 3; z++) {
            let nivel = [
                [null, null, null], // Fila 0 (Y)
                [null, null, null], // Fila 1 (Y)
                [null, null, null]  // Fila 2 (Y)
            ];
            this.tablero.push(nivel);
        }
    }

    /**
     * Ubica una ficha en memoria validando que el lugar exista y esté libre.
     * @param {number} nivel Eje Z (Altura)
     * @param {number} fila Eje Y (Plano Cartesiano)
     * @param {number} columna Eje X (Plano Cartesiano)
     * @param {boolean} valor Símbolo del jugador (true para X, false para O)
     * @returns {boolean} Retorna verdadero si se coloco exitosamente
     */
    colocarFicha(nivel, fila, columna, valor) {

        // Validar límites fijos (0 a 2 para Z, Y, X)
        if (
            nivel < 0 || nivel >= 3 || 
            fila < 0 || fila >= 3 || 
            columna < 0 || columna >= 3
        ) {
            console.log("Posición fuera del tablero 3D");
            return false;
        }

        // Validar valor booleano
        if (valor !== true && valor !== false) {
            console.log("El valor debe ser true o false");
            return false;
        }

        // Validar si la coordenada tridimensional ya está ocupada
        if (this.tablero[nivel][fila][columna] !== null) {
            console.log("La casilla espacial ya está ocupada");
            return false;
        }

        // Colocar ficha
        this.tablero[nivel][fila][columna] = valor;

        return true;
    }

    /**
     * Escanea todo el cubo 3x3x3 intentando encontrar líneas de tres fichas iguales
     * en cualquiera de las direcciones de los 13 ejes posibles del espacio.
     *
     * @returns {Object} Diccionario con el estado ({estado: 'ganador'|'empate'|'continua'})
     */
    verificarGanador() {

        // Las 13 direcciones únicas en un espacio 3D [dz, dx, dy]
        const direcciones = [
            // --- MOVIMIENTOS EN UN MISMO NIVEL (Plano 2D, dz = 0) ---
            [0, 0, 1],   // Horizontal →
            [0, 1, 0],   // Vertical ↓
            [0, 1, 1],   // Diagonal 2D ↘
            [0, 1, -1],  // Diagonal 2D ↙

            // --- MOVIMIENTOS CAMBIANDO DE NIVEL (Profundidad, dz = 1) ---
            [1, 0, 0],   // Caída libre recta (misma fila y columna, baja 1 nivel)
            
            // Diagonales de caras laterales (baja 1 nivel y se mueve en 1 eje)
            [1, 0, 1],   // Baja y se mueve a la derecha
            [1, 0, -1],  // Baja y se mueve a la izquierda
            [1, 1, 0],   // Baja y se mueve al frente
            [1, -1, 0],  // Baja y se mueve atrás
            
            // Diagonales que atraviesan el cubo (baja 1 nivel y se mueve en 2 ejes)
            [1, 1, 1],   // Baja, frente, derecha
            [1, 1, -1],  // Baja, frente, izquierda
            [1, -1, 1],  // Baja, atrás, derecha
            [1, -1, -1]  // Baja, atrás, izquierda
        ];

        let hayEspaciosVacios = false;

        // Recorrer Nivel (Z)
        for (let z = 0; z < 3; z++) {
            // Recorrer Filas (Y)
            for (let i = 0; i < 3; i++) {
                // Recorrer Columnas (X)
                for (let j = 0; j < 3; j++) {

                    const valor = this.tablero[z][i][j];

                    // Detectar espacios vacíos
                    if (valor === null) {
                        hayEspaciosVacios = true;
                        continue;
                    }

                    // Proyectar rayos en las 13 direcciones posibles
                    for (const [dz, dx, dy] of direcciones) {
                        let contador = 1;

                        // Buscar las siguientes 2 fichas en esa dirección
                        for (let k = 1; k < 3; k++) {
                            const nuevoNivel = z + (dz * k);
                            const nuevaFila = i + (dx * k);
                            const nuevaColumna = j + (dy * k);

                            // Verificar límites del cubo 3x3x3
                            if (
                                nuevoNivel < 0 || nuevoNivel >= 3 ||
                                nuevaFila < 0 || nuevaFila >= 3 ||
                                nuevaColumna < 0 || nuevaColumna >= 3
                            ) {
                                break; // Sale del cubo, no es válida esta línea
                            }

                            // Verificar si la ficha coincide
                            if (this.tablero[nuevoNivel][nuevaFila][nuevaColumna] === valor) {
                                contador++;
                            } else {
                                break; // Se rompió la secuencia
                            }
                        }

                        // ¡Ganador tridimensional encontrado!
                        if (contador === 3) {
                            return {
                                estado: "ganador",
                                ganador: valor,
                                coordenadaInicio: { nivel: z, fila: i, columna: j },
                                vectorVictoria: [dz, dx, dy]
                            };
                        }
                    }
                }
            }
        }

        // Si el cubo todavía tiene espacios
        if (hayEspaciosVacios) {
            return { estado: "continua" };
        }

        // El cubo está lleno y nadie conectó 3
        return { estado: "empate" };
    }

    // ========================================
    // REINICIAR TABLERO
    // ========================================
    reiniciarTablero() {
        this.iniciarJuego();
        console.log("¡El cubo 3D ha sido reiniciado por completo!");
    }
}