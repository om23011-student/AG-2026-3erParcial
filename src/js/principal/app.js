import TresEnRaya3D from '../mecanismos/detector_de_ganador.js';
import MotorIA3D from '../mecanismos/motor_ia_3d.js';
import WebGLRenderer from '../complementos/webgl_renderer.js';
import GestorVentanas from '../control/gestor_ventanas.js';
import GestorInterfaz from '../control/gestor_interfaz.js';

// 1. Importamos la clase de dibujo
import LineaDDA from '../complementos/algoritmo_dda.js';
import transformaciones from '../complementos/algoritmo_transformacion.js';

// 2. Instanciamos el generador
const generadorLineas = new LineaDDA();
const transformacion = new transformaciones();

// Estado global de la partida
let configuracionActual = null;
let simboloActual = true; // Empieza X
let juegoActivo = false;
let puntosDeLineaActual = null; // 3. Variable para guardar los puntos calculados
let transformacionLinea = null; // <-- CORRECCIÓN: Variable declarada globalmente

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
let animacionId = null;

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
    
    // Usamos el gl nativo para el color de fondo para evitar errores
    gl.clearColor(0.15, 0.15, 0.18, 1.0); 
    renderer.limpiar();

    // 4. Asignamos un color rojo para que contraste y calculamos la línea
    renderer.setColor(1.0, 0.0, 0.0, 1.0);
    puntosDeLineaActual = generadorLineas.calcularDDA(-0.8, -0.8, -0.8, 0.8);
    
    // CORRECCIÓN: Uso de la variable ya declarada (y corrección de typo)
    transformacionLinea = transformacion.rotacion(puntosDeLineaActual, 0.5); 
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
        // En PvE, si el humano escoge O (false), la IA (X) empieza primero
        turnoIA();
    }
}

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
        renderer.limpiar();
    }
}

// ----------------------------------------
// Lógica de Renderizado Principal
// ----------------------------------------

function renderizarEscena() {
    if (!juegoActivo || !renderer) return;

    renderer.limpiar();

    // 5. Dibujamos la línea si los puntos existen en cada ciclo
    // CORRECCIÓN: Validación con el nombre correcto
    if (transformacionLinea) { 
        renderer.dibujar(transformacionLinea, false, renderer.gl.POINTS);
    }

    // Continuar el bucle recursivo amarrándolo a la velocidad del monitor (60 FPS)
    animacionId = requestAnimationFrame(renderizarEscena);
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