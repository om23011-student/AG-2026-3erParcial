/**
 * app.js
 *
 * Archivo principal (Controlador) de la aplicación.
 * Se encarga de orquestar el flujo del juego, inicializar WebGL, gestionar los turnos,
 * invocar a la IA, y mantener el bucle de renderizado a 60 FPS.
 * Integra de manera central todos los gestores (Input, Interfaz, Gráficos y Lógica).
 */
import TresEnRaya3D from '../mecanismos/detector_de_ganador.js';
import MotorIA3D from '../mecanismos/motor_ia_3d.js';
import WebGLRenderer from '../complementos/webgl_renderer.js';
import GestorVentanas from '../control/gestor_ventanas.js';
import GestorInterfaz from '../control/gestor_interfaz.js';
import GraficadorEscena from '../control/graficador_escena.js';
import GestorInput from '../control/gestor_input.js';

// 1. Instanciamos el tablero principal y sus casillas
import ConstruirGrid from '../mecanismos/construir_grid.js';

const constructorGrid = new ConstruirGrid();
const { tablero, casillas } = constructorGrid.obtenerTablero(); // Obtenemos el tablero de 3x3

// 2. Extraemos toda la lógica matemática visual en su propia entidad
const graficador = new GraficadorEscena(constructorGrid);

const figuras = [];
const decoracionEstatica = graficador.crearDecoracion(); // Solo necesitamos calcular la decoración externa una vez

// Estado global de la partida
let configuracionActual = null;
let simboloActual = true; // Empieza X
let juegoActivo = false;

// Componentes Lógicos
const detectorGanador = new TresEnRaya3D(); // Evalúa victorias en 3D
const motorIA = new MotorIA3D(); // Toma decisiones autónomas
let renderer = null; // Instancia de dibujo en WebGL

// Hover (Resaltado)
let casillaResaltada = null; // Guardará internamente: { nivelIdx, filaIdx, columnaIdx, casilla }

// Gestores Separados (UI)
const interfaz = new GestorInterfaz(); // Controla los textos e interfaz HTML
const ventanas = new GestorVentanas({  // Controla los modales del menú y de fin de juego
    onStartGame: (config) => arrancarPartida(config),
    onReiniciar: () => detenerPartida()
});

// Canvas GL
const canvas = document.getElementById('glcanvas');
let animacionId = null;
let lineaGanadora = []; // Guardará la línea que tachará las fichas ganadoras

// Nuevo controlador abstraído de inputs (Mouse)
// Nuevo controlador abstraído de inputs (Mouse)
const controladorInput = new GestorInput(canvas, casillas, {
    onClick: (celdaPulsada) => {
        ejecutarJugada(celdaPulsada.nivelIdx, celdaPulsada.filaIdx, celdaPulsada.columnaIdx, celdaPulsada.casilla);
    },
    onHover: (celdaApuntada) => {
        if (!juegoActivo || configuracionActual?.modo === 'demo' || (configuracionActual?.modo === 'pve' && simboloActual !== configuracionActual.humSimbolo)) {
            casillaResaltada = null;
            return;
        }

        // --- NUEVA VALIDACIÓN ---
        // Accedemos a la matriz interna del detector para ver si ya hay una ficha ahí (true/false o id de jugador)
        // Nota: Asegúrate de comprobar cómo guarda tu clase 'detectorGanador.tablero' el estado libre (usualmente null, 0 o false)
        const casillaOcupada = detectorGanador.tablero[celdaApuntada.nivelIdx][celdaApuntada.filaIdx][celdaApuntada.columnaIdx];
        
        if (casillaOcupada !== null && casillaOcupada !== undefined && casillaOcupada !== false) {
            casillaResaltada = null; // Si está ocupada, no activamos el relleno
            return;
        }
        // -------------------------

        casillaResaltada = celdaApuntada; 
    }
});

/**
 * Inicializa el contexto de WebGL y la máquina de estado renderizadora.
 */
function initWebGL() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert("Tu navegador no soporta WebGL");
        return;
    }

    // Aseguramos que WebGL renderice en todo el canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    renderer = new WebGLRenderer(gl);
    
    // Usamos el gl nativo para definir el color de limpieza del fondo
    gl.clearColor(0.15, 0.15, 0.18, 1.0);
    renderer.setColor(1.0, 0.0, 0.0, 1.0);
    renderer.limpiar(); 
}

/**
 * Arranca una nueva partida basándose en la configuración enviada por el Gestor de Ventanas.
 * @param {Object} config Opciones seleccionadas (Modo, Nombres, Símbolo escogido)
 */
function arrancarPartida(config) {
    configuracionActual = config;
    juegoActivo = true;
    lineaGanadora = []; // Se limpia la línea ganadora de la partida anterior

    // Ahora la partida siempre inicia con el símbolo que el jugador haya escogido
    if (config.modo === 'demo') {
        simboloActual = true; // X por defecto en demo
    } else {
        simboloActual = config.humSimbolo;
    }

    // Preparar lógica de juego
    detectorGanador.reiniciarTablero();

    // Preparar Gestor Interfaz
    interfaz.limpiarInterfaz();
    interfaz.configurarNombres(config);
    interfaz.actualizarTurno(simboloActual);
    figuras.length = 0; // Limpiamos cualquier figura previa
    // Arrancar WebGL
    if (!renderer) {
        initWebGL();
    } else {
        renderer.limpiar();
    }

    // Cancelar cualquier bucle de renderizado zombi anterior
    if (animacionId) {
        cancelAnimationFrame(animacionId);
    }
    
    // Iniciar el bucle de renderizado único
    renderizarEscena();

    // Comprobar flujos autónomos (IA)
    if (config.modo === 'demo') {
        cicloDemo();
    } else if (config.modo === 'pve' && simboloActual !== config.humSimbolo) {
        // Si por alguna lógica quisieramos que inicie la IA, entraría aquí
        turnoIA();
    }
}

/**
 * Detiene la partida actual, limpiando la memoria del renderizado y el bucle de animaciones.
 */
function detenerPartida() {
    juegoActivo = false;
    configuracionActual = null;
    
    // Matar el bucle de renderizado
    if (animacionId) {
        cancelAnimationFrame(animacionId);
        animacionId = null;
    }
    
    // Limpiar el canvas si existe el renderer
    if (renderer) {
        figuras.length = 0; // Limpiamos cualquier figura previa
        renderer.limpiar();
    }
}

// ----------------------------------------
// Lógica de Renderizado Principal
// ----------------------------------------
/**
 * Bucle infinito que repinta la pantalla simulando 60 fotogramas por segundo (RequestAnimationFrame).
 * Se encarga de ensamblar visualmente los diferentes componentes (Tablero, Figuras, Highlight, Victoria).
 */
// ----------------------------------------
// Lógica de Renderizado Principal
// ----------------------------------------
function renderizarEscena() {
    if (!renderer) return;

    renderer.limpiar();

    if (tablero.n2) {
        renderer.limpiar();

        // 1. Calculamos el relieve si hay una casilla seleccionada
        let figurasHighlight = [];
        if (casillaResaltada) {
            figurasHighlight = graficador.crearRelieveRelleno(casillaResaltada.casilla, casillaResaltada.nivelIdx);
        }

        // 2. Pintamos primero la estructura del tablero (Rojo)
        renderer.setColor(1.0, 0.0, 0.0, 1.0);
        renderer.dibujar(tablero.n2, false, renderer.gl.POINTS);
        renderer.dibujar(tablero.n1, false, renderer.gl.POINTS);
        renderer.dibujar(tablero.n3, false, renderer.gl.POINTS);
        renderer.dibujar(decoracionEstatica, false, renderer.gl.POINTS);

        // 3. Pintamos el relleno del HOVER (Amarillo) DEBAJO de las fichas
        if (figurasHighlight.length > 0) {
            renderer.setColor(1.0, 1.0, 0.0, 1.0); 
            renderer.dibujar(figurasHighlight, true, renderer.gl.POINTS);
        }

        // 4. Pintamos las FICHAS (X u O) al final para que queden encima de todo
        renderer.setColor(1.0, 0.0, 0.0, 1.0); // Aseguramos el color de las fichas o el que uses
        renderer.dibujar(figuras, true, renderer.gl.POINTS);

        // 5. La línea ganadora en la capa superior absoluta
        if (lineaGanadora && lineaGanadora.length > 0) {
            renderer.setColor(0.0, 1.0, 1.0, 1.0); 
            renderer.dibujar(lineaGanadora, true, renderer.gl.POINTS);
        }
    }

    animacionId = requestAnimationFrame(renderizarEscena);
}

// ----------------------------------------
// Lógica de IA y Turnos
// ----------------------------------------
/**
 * Activa la Inteligencia Artificial simulando que "piensa" y luego genera su movimiento.
 */
function turnoIA() {
    if (!juegoActivo) return;

    // Obtener tiempo de delay estético según la dificultad
    const tiempo = motorIA.obtenerTiempoPensamiento(configuracionActual.modo);

    setTimeout(() => {
        // Pedirle al motor de IA su mejor decisión basada en la situación actual del tablero
        const movimiento = motorIA.obtenerMejorMovimiento(detectorGanador.tablero);

        Object.values(casillas).forEach((nivel, nivelIdx) => {
            if (nivelIdx === movimiento.nivel) {
                ejecutarJugada(movimiento.nivel, movimiento.fila, movimiento.columna, nivel[movimiento.fila][movimiento.columna]);
            }
        });

        if (configuracionActual.modo === 'demo' && juegoActivo) {
            turnoIA();
        }
    }, tiempo);
}

/**
 * Mantiene a la IA jugando contra sí misma de forma recursiva en el modo de Demostración.
 */
function cicloDemo() {
    turnoIA();
}

/**
 * Lógica principal llamada cada vez que hay una jugada válida (Humano o IA).
 * Registra el movimiento, pinta la ficha en WebGL y verifica si hay victoria.
 *
 * @param {number} nivel Índice del nivel Z (0 al 2)
 * @param {number} fila Índice de la fila Y (0 al 2)
 * @param {number} columna Índice de la columna X (0 al 2)
 * @param {Object} casilla Coordenadas planas asociadas de la cuadrícula interactiva
 */
function ejecutarJugada(nivel, fila, columna, casilla) {
    if (!juegoActivo) return;

    // Intentar asentar el movimiento en el núcleo matricial (Verifica que no esté ocupada)
    if (detectorGanador.colocarFicha(nivel, fila, columna, simboloActual)) {

        // Delegar al graficador la creación visual de las fichas
        if (simboloActual) {
            figuras.push(...graficador.crearFichaX(casilla, nivel));
        } else {
            figuras.push(...graficador.crearFichaO(casilla, nivel));
        }

        // Cambiar la batuta visual y lógica al otro jugador
        simboloActual = !simboloActual;
        interfaz.actualizarTurno(simboloActual);
    }

    // Verificar si la partida terminó tras la jugada
    const resultado = detectorGanador.verificarGanador();

    if (resultado.estado === 'ganador' || resultado.estado === 'empate') {
        juegoActivo = false;

        // Construir línea de victoria si hay un ganador usando el abstraedor visual
        if (resultado.estado === 'ganador') {
            lineaGanadora = graficador.crearLineaVictoria(resultado, casillas);
        }

        interfaz.mostrarResultado(resultado, configuracionActual);
    } else {

        // Si el siguiente en tirar es la IA
        if (configuracionActual.modo === 'pve' && simboloActual !== configuracionActual.humSimbolo) {
            turnoIA();
        }
    }
}
