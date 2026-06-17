import TresEnRaya3D from '../mecanismos/detector_de_ganador.js';
import MotorIA3D from '../mecanismos/motor_ia_3d.js';
import WebGLRenderer from '../complementos/webgl_renderer.js';
import GestorVentanas from '../control/gestor_ventanas.js';
import GestorInterfaz from '../control/gestor_interfaz.js';

// Estado global de la partida
let configuracionActual = null;
let simboloActual = true; // Empieza X
let juegoActivo = false;

// Componentes Lógicos
const detectorGanador = new TresEnRaya3D();
const motorIA = new MotorIA3D();
let renderer = null;

// Gestores Separados (UI)
const interfaz = new GestorInterfaz();
const ventanas = new GestorVentanas({
    onStartGame: (config) => arrancarPartida(config),
    onReiniciar: () => detenerPartida()
});

// Canvas GL
const canvas = document.getElementById('glcanvas');

function initWebGL() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert("Tu navegador no soporta WebGL");
        return;
    }

    renderer = new WebGLRenderer(gl);
    renderer.limpiar();
    // Aquí puedes iniciar tu GridBuilder y renderizar el tablero vacío 3D
}

function arrancarPartida(config) {
    configuracionActual = config;
    juegoActivo = true;
    simboloActual = true; // X

    // Preparar lógica de juego
    detectorGanador.reiniciarTablero();

    // Preparar Gestor Interfaz
    interfaz.limpiarInterfaz();
    interfaz.configurarNombres(config);
    interfaz.actualizarTurno(simboloActual);

    // Arrancar WebGL
    if (!renderer) {
        initWebGL();
    } else {
        renderer.limpiar();
    }

    // Comprobar flujos autónomos (IA)
    if (config.modo === 'demo') {
        cicloDemo();
    } else if (config.modo === 'pve' && simboloActual !== config.humSimbolo) {
        // En PvE, si el humano escoge O (false), la IA (X) empieza primero
        turnoIA();
    }
}

function detenerPartida() {
    juegoActivo = false;
    configuracionActual = null;
}

// ----------------------------------------
// Lógica de IA y Turnos
// ----------------------------------------
function turnoIA() {
    if (!juegoActivo) return;

    const tiempo = motorIA.obtenerTiempoPensamiento(configuracionActual.modo);

    setTimeout(() => {
        const movimiento = motorIA.obtenerMejorMovimiento(detectorGanador.tablero);
        ejecutarJugada(movimiento.nivel, movimiento.fila, movimiento.columna);

        if (configuracionActual.modo === 'demo' && juegoActivo) {
            turnoIA();
        }
    }, tiempo);
}

function cicloDemo() {
    turnoIA();
}

function ejecutarJugada(nivel, fila, columna) {
    if (!juegoActivo) return;

    // Intentar asentar el movimiento en el núcleo duro de evaluación
    if (detectorGanador.colocarFicha(nivel, fila, columna, simboloActual)) {
        // TODO: ACTUALIZAR RENDERIZADO AQUÍ CON WEBGL

        // Verificar si la partida terminó tras la jugada
        const resultado = detectorGanador.verificarGanador();

        if (resultado.estado === 'ganador' || resultado.estado === 'empate') {
            juegoActivo = false;
            interfaz.mostrarResultado(resultado, configuracionActual);
        } else {
            // Cambiar la batuta visual y lógica al otro jugador
            simboloActual = !simboloActual;
            interfaz.actualizarTurno(simboloActual);

            // Si el siguiente en tirar es la IA
            if (configuracionActual.modo === 'pve' && simboloActual !== configuracionActual.humSimbolo) {
                turnoIA();
            }
        }
    }
}

