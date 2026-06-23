# Documentación Técnica Detallada - Tic Tac Toe 3D

Este documento detalla todas las modificaciones, correcciones, rediseños y refactorizaciones arquitectónicas realizadas en el proyecto. Se explica el **qué, cómo y por qué** de cada intervención para garantizar una plena comprensión del código fuente.

---

## 1. Modificaciones Core (Renderizado y Matemáticas 3D)

### Problema Inicial
Las fichas (X y O) no se estaban dibujando de acuerdo a la perspectiva de la cuadrícula. Se veían alteradas, con líneas extrañas o rotas. Esto se debía a que los algoritmos de dibujo (`LineaDDA` y `Bresenham`) generaban un arreglo `[x, y, 0.0]`, pero antes de enviarlos a WebGL se les pasaba por una función errónea llamada `agregarZ0` que interponía *ceros extra* cada 2 valores, rompiendo los lotes de 3 coordenadas que espera el *Vertex Shader*. Además, se dibujaban sobre coordenadas que *ya habían sido deformadas*, duplicando la distorsión.

### ¿Qué se hizo?
*   **Pipeline de Transformación Estricto**: Se eliminó `agregarZ0`. Se modificó la filosofía de renderizado para aplicar un principio básico de la computación gráfica: **"Dibuja en plano local y luego proyéctalo al espacio del mundo"**.
*   **Ejecución**: Ahora las formas ("X" y "O") se calculan con primitivas 2D planas utilizando los bounds originales (`x0, y0, x1, y1`) de la matriz matemática. Posteriormente a dibujarlas perfectamente cuadradas, se pasan por el motor `transformarFigura()` de `ConstruirGrid`.
*   **El Por Qué**: Esto asegura que las fichas sufran exactamente la misma rotación de 60°, escala, cizalladura y punto de fuga que sufren las casillas de la rejilla. Esto garantiza que encajen perfectas en su perspectiva tridimensional espacial. Añadimos también `trasladarFiguraNivel` para subirlas o bajarlas en el eje transversal dependiendo el "piso" del cubo donde se juegue.

---

## 2. Rediseño de la UI/UX (Glassmorphism & Modales)

### ¿Qué se hizo?
Se erradicó el estilo plano inicial adoptando un estilo altamente moderno basado en **Glassmorphism (Efecto Cristal)**.

*   **Menús y Contenedores**: Sustitución de colores sólidos por configuraciones `rgba()` semi-transparentes combinadas con la propiedad de CSS `backdrop-filter: blur(15px)`.
*   **El HUD de jugadores**: Se remplazaron las cajas de texto clásicas por cápsulas luminosas. Mediante gradientes y `box-shadow` rojo vivo, la indicación del turno actual "se enciende" con un efecto como de tubos de neón flotantes, que reaccionan creciendo con `transform: scale(1.05)`.
*   **Modal de Ganador Libre de Visión**: El menú modal se reconfiguró por completo de un diseño centrado a pantalla completa (Full-screen Overlay) a un modal elegante lateral derecho con animación tipo `slideInRight` e inhabilitación temporal del fondo con `pointer-events: none`.
*   **El Por Qué**: Un juego 3D con aspecto de retícula tipo "alambre" requiere un entorno estético tecnológico/cyberpunk. Ocultar el centro de la pantalla bloqueaba la visibilidad de la matriz una vez terminado el juego. Mover la victoria a un lado le permite analizar al usuario la última jugada ganadora sin frustraciones visuales.

---

## 3. Interactividad (Resaltado de Casillas e Inputs)

### ¿Qué se hizo?
Se añadió una mecánica visual para que el usuario sepa en todo momento qué casilla espacial le está apuntando con el puntero del mouse (Hover amarillo fluido). 

*   **Normalización y Ray-Casting Abstraído**: El navegador Windows/Linux lee clics en formato de "píxeles reales" (Ej. X = 800, Y = 600). WebGL, sin embargo, maneja coordenadas normalizadas obligadas en un plano que va de `-1.0` a `1.0`. Se creó una abstracción geométrica que transforma esos píxeles reales al espacio coordenado de WebGL al instante.
*   **Resaltado Matemático**: En el método `crearResaltado`, al encontrar una colisión positiva (El puntero está dentro de los límites de una celda), se calculan momentáneamente cuatro líneas rectas (formando un paralelogramo) achicadas por un pequeño *padding* en relación a esa casilla, se envían por la tubería de isometría espacial 3D y el WebGL las repinta en amarillo a 60 fotogramas por segundo.
*   **El Por Qué**: Al ser el tablero tridimensional con cizalladuras agresivas e inclinaciones, hacer clic "intuitivamente" era sumamente complejo. El usuario necesitaba "feedback" en tiempo real para visualizar geométricamente si su cursor estaba afectando el "piso de arriba" o "piso de en medio".

---

## 4. Efecto de Fin de Partida (El Rayo Vectorial de Victoria)

### ¿Qué se hizo?
Cuando un jugador o la Inteligencia Artificial logran formar un tres en raya en un arreglo multidimensional, además del texto flotante del ganador, se dibuja temporalmente una línea gruesa trazando el vector ganador (Cyan brillante).

*   **¿Cómo funciona?**: El sistema `detector_de_ganador.js` nos obsequia la `casillaInicio` de la línea exitosa y además su `vectorVictoria` el cual indica hacía qué eje del espacio (profundidad, altura, ancho) se movió la conexión: `[dz, dy, dx]`.
*   Aprovechando esto, encontramos la casilla 1, adivinamos la posición de la Casilla 3 sumándole dos casillas según ese vector de dirección y sacamos los centros.
*   **Diagonalidad Tridimensional**: Si conectas una racha de tres pero cruzando desde el piso de arriba hasta el piso de abajo pasando por el centro (es decir, variando en el eje Z o Altura cruzada simultáneamente en diagonal), pasamos estas coordenadas maestras ya resultadas de la matriz espacial por el algoritmo Genérico de rasterización pura **DDA (Digital Differential Analyzer)** para dibujar un rayo perfecto sin estragos algorítmicos.
*   **Fix Extra de Estado Prístino**: Aseguramos también que el bug que forzaba a empezar con 'X' muriera. Ahora, el script recupera lo instanciado en el modal y se lo impone forzosamente a la variable global de estados.

---

## 5. Refactorización Profunda y Arquitectura de Software

El código inicial poseía un antipatrón conocido como *God Object* (Un archivo inmenso `app.js` tratando de manejar eventos de hardware, cálculos matemáticos duros, manipulación de DOM, turnos y loops de bucle). Lo solucionamos implementando un firme **Single Responsibility Principle (Principio de Responsabilidad Única)**.

### Se crearon dos nuevos módulos vitales:

1.  **`graficador_escena.js`**: 
    - Extrae el peso de las matemáticas visuales. Funciona como un servicio "Proxy". En lugar de que la `app.js` calcule 50 líneas sobre cómo dibujar formas cruzando interpolando DDA con la malla actual, solo llama a `graficador.crearFichaX(...)` esperando cómodamente un arreglo de bytes listos para dibujarse en WebGL Buffer, ignorando totalmente cómo diablos ocurrió tras bastidores.
2.  **`gestor_input.js`**:
    - Abstrae una enredadera masiva de `eventListeners` ligados al navegador. Alimenta a la pantalla de pura data curada a través de cómodos disparadores `onClick` o `onHover`. Su responsabilidad principal es tomar el rastreo incomprensible de los píxeles caóticos que transcurren al mover el mouse velozmente y arrojar solo la pureza de un objeto en concreto al momento en que hubo una colisión verdadera.

### El Por Qué (Beneficios de estos cambios):
-   **Lectura de Código Prístino:** `app.js` disminuyó su peso a más de la mitad, luciendo como lo que realmente es: "Un controlador global que define turnos y ordena arranques o paradas de juego".
-   **Eficiencia en Render**: Ahora elementos fijos de diseño pesado, como decoraciones exteriores al cubo principal `decoracionEstatica`, se calculan obligatoriamente *una* vez usando RAM limpia y permanente en vez de forzar al procesador en cada iteración del bucle *60 FPS* (`requestAnimationFrame()`).
-   **Documentación de Categoría Mundial (JSDoc)**: Todos los componentes han sido anotados profesionalmente. Cualquier programador puede posicionarse sobre un método y saber instantáneamente de dónde viene una coordenada o qué arreglos matriciales devuelve, salvando horas inmedibles de tiempo para el mantenimiento futuro.
