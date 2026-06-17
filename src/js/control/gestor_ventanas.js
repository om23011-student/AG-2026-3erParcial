export default class GestorVentanas {
    constructor(callbacks) {
        // Enlaces de comunicación con app.js (el núcleo base de la app)
        this.onStartGame = callbacks.onStartGame;
        this.onReiniciar = callbacks.onReiniciar;

        // Contenedores principales del flujo de pantallas
        this.menuContainer = document.getElementById('menu-container');
        this.gameContainer = document.getElementById('game-container');
        
        // Modales de preguntas iniciales
        this.symbolModal = document.getElementById('symbol-modal'); // Modal genérico PvE
        this.symbol1v1Modal = document.getElementById('symbol-1v1-modal'); // Modal exclusivo 1v1

        // Plantilla de configuraciones a enviar cuando un juego es encendido
        this.config = {
            modo: null, // Guardará el ID del modo de juego (ej. '1v1', 'pve', 'demo')
            nombre1: 'Jugador 1', // Nombres predeterminados constantes (removidos inputs)
            nombre2: 'Jugador 2',
            humSimbolo: true // Booleano: true el jugador/usuario usa X, false usa O
        };

        this._enlazarEventos();
    }

    /**
     * Suscribe todos los listeners de los botones del menú inicial
     */
    _enlazarEventos() {
        
        // ---- INICIADORES DE MODOS ---- //
        
        // Modo 1: Multijugador en local
        document.getElementById('btn-1v1').addEventListener('click', () => {
            this.config.modo = '1v1';
            this.symbol1v1Modal.style.display = 'flex'; // En 1v1 preguntamos quién quiere ser qué
        });

        // Modo 2: Jugador vs Motor de IA
        document.getElementById('btn-pve').addEventListener('click', () => {
            this.config.modo = 'pve';
            this.symbolModal.style.display = 'flex'; // Preguntar el símbolo usando el panel general
        });

        // Modo 3: Demostración Autónoma
        document.getElementById('btn-demo').addEventListener('click', () => {
            this.config.modo = 'demo';
            this.validarYArrancar(); // La demstración arranca directamente sin preguntas
        });

        // ---- BOTONES DENTRO DE LOS MODALES DE PvE ---- //
        
        document.getElementById('btn-select-x').addEventListener('click', () => {
            this.config.humSimbolo = true; // Humano se queda con la 'X'
            this.symbolModal.style.display = 'none'; // Ocultamos modal
            this.validarYArrancar(); // Despegamos motores
        });

        document.getElementById('btn-select-o').addEventListener('click', () => {
            this.config.humSimbolo = false; // Humano se queda con 'O', IA tomará 'X'
            this.symbolModal.style.display = 'none';
            this.validarYArrancar();
        });

        // Cancelar y ocultar el modal para volver al menú
        document.getElementById('btn-cancel-symbol').addEventListener('click', () => {
            this.symbolModal.style.display = 'none';
        });

        // ---- BOTONES DENTRO DE LOS MODALES DE 1v1 ---- //
        
        document.getElementById('btn-1v1-select-x').addEventListener('click', () => {
            this.config.humSimbolo = true; // Jugador 1 es X
            this.symbol1v1Modal.style.display = 'none';
            this.validarYArrancar();
        });

        document.getElementById('btn-1v1-select-o').addEventListener('click', () => {
            this.config.humSimbolo = false; // Jugador 1 es O
            this.symbol1v1Modal.style.display = 'none';
            this.validarYArrancar();
        });

        document.getElementById('btn-cancel-1v1-symbol').addEventListener('click', () => {
            this.symbol1v1Modal.style.display = 'none';
        });

        // ---- BOTÓN DE REINICIAR AL FINALIZAR UNA PARTIDA ---- //
        
        document.getElementById('btn-volver-menu').addEventListener('click', () => {
            this.mostrarMenu(); // Cambia de pantalla
            this.gameOverModal = document.getElementById('game-over-modal');
            if (this.gameOverModal) {
                this.gameOverModal.style.display = 'none'; // Cierra la ventana emergente de victoria
            }
            if(this.onReiniciar) this.onReiniciar(); // Avisa a app.js que detenga sus lógicas/bots
        });
    }

    /**
     * Aplica la configuración, ejecuta cambio de vistas y notifica a app.js que inicie todo.
     */
    validarYArrancar() {
        // Inicializamos los nombres default genéricos
        this.config.nombre1 = "Jugador 1";
        this.config.nombre2 = "Jugador 2";

        // Manda oscurecer el menú y mostrar la interfaz del juego
        this.mostrarJuego();

        // Notificamos a la lógica principal enviándole los parámetros limpios
        if (this.onStartGame) {
            this.onStartGame(this.config);
        }
    }

    // Funciones utilitarias para cambiar de página (display CSS swap)
    mostrarMenu() {
        this.gameContainer.style.display = 'none';
        this.menuContainer.style.display = 'flex';
    }

    mostrarJuego() {
        this.menuContainer.style.display = 'none';
        this.gameContainer.style.display = 'block';
    }
}
