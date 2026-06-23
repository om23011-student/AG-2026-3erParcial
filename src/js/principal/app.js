import TresEnRaya3D from '../mecanismos/detector_de_ganador.js';
import MotorIA3D from '../mecanismos/motor_ia_3d.js';
import WebGLRenderer from '../complementos/webgl_renderer.js';
import GestorVentanas from '../control/gestor_ventanas.js';
import GestorInterfaz from '../control/gestor_interfaz.js';

// 1. Importamos la clase de dibujo
import LineaDDA from '../complementos/algoritmo_dda.js';
import ConstruirGrid from '../mecanismos/construir_grid.js';
import AlgoritmoElipse from '../complementos/algoritmos_bresenham.js';

// 2. Instanciamos el generador
const generadorLineas = new LineaDDA();
const constructorGrid = new ConstruirGrid();
const generadorElipse = new AlgoritmoElipse();
const { tablero, casillas } = constructorGrid.obtenerTablero(); // Obtenemos el tablero de 3x3
const figuras = [];

function detectarCasilla (x, y) {    
    Object.values(casillas).forEach((nivel, nivelIdx) => {
        nivel.forEach((fila, filaIdx) => {
            fila.forEach((casilla, columnaIdx) => {
                if (x >= casilla.xMin && x <= casilla.xMax && y >= casilla.yMin && y <= casilla.yMax) {
                    ejecutarJugada(nivelIdx, filaIdx, columnaIdx, casilla);
                }
            });
        });
    });
}

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
let animacionId = null;

canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = parseInt((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = parseInt((e.clientY - rect.top) * (canvas.height / rect.height));
    const xNorm = (x / canvas.width) * 2 - 1; // Normalizamos a [-1, 1]
    const yNorm = -((y / canvas.height) * 2 - 1); // Invertimos el eje Y para que coincida con WebGL
    detectarCasilla(xNorm, yNorm);
});

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
    renderer.setColor(1.0, 0.0, 0.0, 1.0);
    renderer.limpiar(); 
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
        figuras.length = 0; // Limpiamos cualquier figura previa
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
    if (tablero.n2) { 
        renderer.limpiar();
        renderer.dibujar(tablero.n2, false, renderer.gl.POINTS);
        renderer.dibujar(tablero.n1, false, renderer.gl.POINTS);
        renderer.dibujar(tablero.n3, false, renderer.gl.POINTS);
        renderer.dibujar(figuras, true, renderer.gl.POINTS);
        decoracionTablero();
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

function cicloDemo() {
    turnoIA();
}

function ejecutarJugada(nivel, fila, columna, casilla) {
    if (!juegoActivo) return;

    // Intentar asentar el movimiento en el núcleo duro de evaluación
    if (detectorGanador.colocarFicha(nivel, fila, columna, simboloActual)) {
        // TODO: ACTUALIZAR RENDERIZADO AQUÍ CON WEBGL
        // Reducimos las coordenadas originales para aplicar un pequeño margen (padding) a las fichas
        const padding = 0.1;
        const xMinOriginal = casilla.x0 + padding;
        const xMaxOriginal = casilla.x1 - padding;
        const yMinOriginal = casilla.y0 + padding;
        const yMaxOriginal = casilla.y1 - padding;

        if (simboloActual) {
            // Dibujar X usando coordenadas no transformadas
            const linea1 = generadorLineas.calcularDDA(xMinOriginal, yMinOriginal, xMaxOriginal, yMaxOriginal);
            const linea2 = generadorLineas.calcularDDA(xMaxOriginal, yMinOriginal, xMinOriginal, yMaxOriginal);

            let forma1 = constructorGrid.transformarFigura(linea1);
            forma1 = constructorGrid.trasladarFiguraNivel(forma1, nivel);
            figuras.push(...forma1);

            let forma2 = constructorGrid.transformarFigura(linea2);
            forma2 = constructorGrid.trasladarFiguraNivel(forma2, nivel);
            figuras.push(...forma2);
        } else {
            // Dibujar O usando coordenadas no transformadas
            const x = (xMinOriginal + xMaxOriginal) / 2;
            const y = (yMinOriginal + yMaxOriginal) / 2;
            const radio = Math.min(xMaxOriginal - xMinOriginal, yMaxOriginal - yMinOriginal) / 2;

            const circulo1 = generadorElipse.calcularCirculo(x, y, radio);
            let formaO1 = constructorGrid.transformarFigura(circulo1);
            formaO1 = constructorGrid.trasladarFiguraNivel(formaO1, nivel);
            figuras.push(...formaO1);

            const circulo2 = generadorElipse.calcularCirculo(x, y, radio * 0.8);
            let formaO2 = constructorGrid.transformarFigura(circulo2);
            formaO2 = constructorGrid.trasladarFiguraNivel(formaO2, nivel);
            figuras.push(...formaO2);
        }
        // Cambiar la batuta visual y lógica al otro jugador
        simboloActual = !simboloActual;
        interfaz.actualizarTurno(simboloActual);
    }

        // Verificar si la partida terminó tras la jugada
        const resultado = detectorGanador.verificarGanador();

        if (resultado.estado === 'ganador' || resultado.estado === 'empate') {
            juegoActivo = false;
            interfaz.mostrarResultado(resultado, configuracionActual);
        } else {

            // Si el siguiente en tirar es la IA
            if (configuracionActual.modo === 'pve' && simboloActual !== configuracionActual.humSimbolo) {
                turnoIA();
            }
        }
    }

function decoracionTablero() {
    const decoracion = [];
    decoracion.push(...generadorLineas.calcularDDA(-0.74, -0.49, -0.74, 0.71));
    decoracion.push(...generadorLineas.calcularDDA(0.85, -0.72, 0.85, 0.47));
    decoracion.push(...generadorLineas.calcularDDA(-0.16, 0.32, -0.16, -0.87));
    decoracion.push(...generadorLineas.calcularDDA(0.12, 0.37, 0.12, 0.21));
    decoracion.push(...generadorLineas.calcularDDA(0.12, -0.24, 0.12, -0.39));
    renderer.dibujar(decoracion, false, renderer.gl.POINTS);
}
