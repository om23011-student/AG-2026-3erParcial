export default class GestorInterfaz {
    constructor() {
        // Obtenemos las referencias a los elementos del HUD (Heads-Up Display)
        this.hudContainer = document.getElementById('hud-container');
        this.player1Info = document.getElementById('player1-info');
        this.player2Info = document.getElementById('player2-info');

        // Referencias al modal de "Fin del Juego"
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverText = document.getElementById('game-over-text');
    }

    /**
     * Configura los nombres dinámicos en las esquinas de la pantalla
     * determinando la distribución elegida (quién va con la 'X' y quién con la 'O').
     * @param {Object} config - Configuración actual de la partida.
     */
    configurarNombres(config) {
        let nombre1 = config.nombre1 || "Jugador 1";
        let nombre2 = config.nombre2 || "Jugador 2";

        // Caso: Partidas contra el Motor IA
        if (config.modo === 'pve') {
            // El humano empieza con "X"
            if (config.humSimbolo === true) {
                nombre1 = config.nombre1 || "Jugador";
                nombre2 = "Motor IA";
            } 
            // El humano juega con "O"
            else {
                nombre1 = "Motor IA";
                nombre2 = config.nombre1 || "Jugador";
            }
        } 
        // Caso: Partidas Multijugador Locales
        else if (config.modo === '1v1') {
            // En 1v1 el Jugador 1 eligió iniciar con "X"
            if (config.humSimbolo === true) {
                nombre1 = config.nombre1;
                nombre2 = config.nombre2;
            } 
            // El Jugador 1 eligió "O", entonces el Jugador 2 toma su lugar en el lado de las "X"
            else {
                nombre1 = config.nombre2;
                nombre2 = config.nombre1;
            }
        } 
        // Caso: CPU vs CPU
        else if (config.modo === 'demo') {
            nombre1 = "Motor IA (X)";
            nombre2 = "Motor IA (O)";
        }

        // Se inyecta el texto final a las etiquetas del HTML
        this.player1Info.innerText = `${nombre1} [X]`;
        this.player2Info.innerText = `${nombre2} [O]`;
    }

    /**
     * Cambia de color (ilumina) la etiqueta del jugador al que le toca realizar un movimiento.
     * @param {boolean} esTurnoX - true si es el turno de X, false si es el turno de O.
     */
    actualizarTurno(esTurnoX) {
        if (esTurnoX) {
            this.player1Info.classList.add('turno-activo');
            this.player2Info.classList.remove('turno-activo');
        } else {
            this.player2Info.classList.add('turno-activo');
            this.player1Info.classList.remove('turno-activo');
        }
    }

    /**
     * Manda a mostrar el panel gris en toda la pantalla anunciando al Ganador o un Empate.
     * @param {Object} resultado - Un objeto traido del detector de ganador.
     * @param {Object} config - Configuración actual de la partida.
     */
    mostrarResultado(resultado, config) {
        let mensaje = "";
        
        // Si el detector devolvió que se formó la línea
        if (resultado.estado === 'ganador') {
            // resultado.ganador es un booleano (true=X, false=O)
            const ganadorX = resultado.ganador;
            mensaje = `¡Ganó ${ganadorX ? 'X' : 'O'}!`;
        } 
        // Si el tablero se llenó y no hubo líneas de victoria
        else if (resultado.estado === 'empate') {
            mensaje = "¡Empate! Nadie conectó 3";
        }

        // Actualizamos el H2 dinámicamente y desplegamos el Modal de Fin de Juego
        this.gameOverText.innerText = mensaje;
        this.gameOverModal.style.display = 'flex';
    }

    /**
     * Resetea el aspecto visual ocultando paneles y apagando las luces de turnos,
     * preparándose para una próxima partida limpia.
     */
    limpiarInterfaz() {
        this.gameOverModal.style.display = 'none';
        this.gameOverText.innerText = "";
        this.player1Info.classList.remove('turno-activo');
        this.player2Info.classList.remove('turno-activo');
    }
}
