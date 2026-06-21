/**
 * Flags para indicar el eje de reflexion en la transformacion de espejo.
 * IZQ: Refleja sobre el eje vertical (eje Y).
 * DER: Refleja sobre el eje horizontal (eje X).
 * AMBOS: Refleja sobre ambos ejes (origen).
 */
export const EJES = {
  IZQ: 0,
  DER: 1,
  AMBOS: 2,
};

/**
 * Clase para realizar transformaciones a un arreglo plano de coordenadas.
 */
export default class Transformacion {
  /**
   * Aplica una matriz de transformación a un arreglo de coordenadas.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas.
   * @param {Array<Array<number>>} matriz Matriz de transformacion.
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas transformadas.
   */
  aplicarTransformacion(coords, matriz) {
    const resultado = [];

    // CORRECCIÓN MAGISTRAL: Saltamos de 3 en 3 para leer [X, Y, Z]
    for (let i = 0; i < coords.length; i += 3) {
      const x = coords[i];
      const y = coords[i + 1];
      const z = coords[i + 2]; // Guardamos la Z intacta

      const nuevoX = matriz[0][0] * x + matriz[0][1] * y;
      const nuevoY = matriz[1][0] * x + matriz[1][1] * y;

      // Devolvemos el punto nuevamente en formato 3D
      resultado.push(nuevoX, nuevoY, z);
    }

    return resultado;
  }

  /**
   * Aplica un escalado simétrico a un arreglo de coordenadas.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas.
   * @param {number} factor Factor de escalado simetrico.
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas escaladas o vacio.
   */
  escalado(coords, factor) {
    // CORRECCIÓN: coords en lugar de array
    if (coords.length === 0 || factor === 0) {
      return [];
    }

    const matrizTransformacion = [
      [factor, 0],
      [0, factor],
    ];

    // CORRECCIÓN: agregado el this.
    return this.aplicarTransformacion(coords, matrizTransformacion);
  }

  /**
   * Transforma un arreglo de coordenadas aplicando una cizalladura.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas.
   * @param {number} angulo Angulo de cizalladura en radianes (no debe ser π/2 ni 3π/2).
   * @returns {Array<number>} Nuevo arreglo de coordenadas o vacio.
   */
  cizalladura(coords, angulo) {
    // CORRECCIÓN: coords en lugar de array y arreglada lógica del ===
    if (
      coords.length === 0 ||
      Math.abs(angulo) === Math.PI / 2 ||
      Math.abs(angulo) === (3 * Math.PI) / 2
    ) {
      return [];
    }

    const matrizTransformacion = [
      [1, Math.tan(angulo)],
      [0, 1],
    ];

    // CORRECCIÓN: agregado el this.
    return this.aplicarTransformacion(coords, matrizTransformacion);
  }

  /**
   * Transforma un arreglo de coordenadas aplicando una reflexion.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas.
   * @param {number} eje Eje de reflexion.
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas reflejadas o vacio.
   */
  espejo(coords, eje) {
    if (coords.length === 0 || eje === null || eje === undefined) {
      return [];
    }

    let matrizTransformacion;

    // CORRECCIÓN: === en lugar de =, uso de EJES y corrección de matrices
    if (eje === EJES.IZQ) {
      matrizTransformacion = [
        [-1, 0],
        [0, 1],
      ];
    } else if (eje === EJES.DER) {
      matrizTransformacion = [
        [1, 0],
        [0, -1],
      ];
    } else if (eje === EJES.AMBOS) {
      matrizTransformacion = [
        [-1, 0],
        [-0, -1],
      ];
    } else {
      return [];
    }

    // CORRECCIÓN: agregado el this.
    return this.aplicarTransformacion(coords, matrizTransformacion);
  }

  /**
   * Transforma un arreglo de coordenadas aplicando una rotacion.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas.
   * @param {number} angulo Angulo de rotacion en radianes.
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas rotadas o vacio.
   */
  rotacion(coords, angulo) {
    const cos = Math.cos(angulo);
    const sin = Math.sin(angulo);

    const matrizTransformacion = [
      [cos, -sin],
      [sin, cos],
    ];

    // CORRECCIÓN: agregado el this.
    return this.aplicarTransformacion(coords, matrizTransformacion);
  }

  /**
   * Transforma un arreglo de coordenadas aplicando la división de perspectiva (W).
   * * @param {Array<number>} coords Arreglo plano de coordenadas [X, Y, Z...].
   * @param {number} distanciaFocal Qué tan rápido crece W. (Ej: 0.5 a 1.5).
   *
   * @returns {Array<number>} Nuevo arreglo con el efecto de profundidad.
   */
  puntoFuga(coords, distanciaFocal) {
    if (coords.length === 0 || distanciaFocal === 0) {
      return [...coords];
    }

    const resultado = [];

    // Recorremos de 3 en 3 leyendo [X, Y, Z]
    for (let i = 0; i < coords.length; i += 3) {
      const x = coords[i];
      const y = coords[i + 1];
      const z = coords[i + 2];

      // 1. CALCULAMOS 'W'
      // Como nuestro tablero es 2.5D, usamos 'Y' (lo que está más arriba en pantalla)
      // para simular la lejanía en profundidad.
      // Si el punto está abajo (Y negativo), W será más pequeño (Near).
      // Si el punto está arriba (Y positivo), W será más grande (Far).
      let w = 1 + (y * distanciaFocal); // Ajustamos la velocidad de cambio con distanciaFocal

      // Evitamos que W se vuelva cero o negativo para que la cámara no se "voltee" o explote
      if (w <= 0.1) {
          w = 0.1; 
      }

      // 2. DIVISIÓN DE PERSPECTIVA (La matemática de tu clase)
      const nuevoX = x / w;
      const nuevoY = y / w; 
      // Nota: Si usáramos Z real, aquí también haríamos z / w

      resultado.push(nuevoX, nuevoY, z);
    }

    return resultado;
  }

  /**
   * Traslada (mueve) las coordenadas en los ejes X, Y y Z.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas [X, Y, Z...].
   * @param {number} tx Desplazamiento en X (positivo=derecha, negativo=izquierda).
   * @param {number} ty Desplazamiento en Y (positivo=arriba, negativo=abajo).
   * @param {number} tz Desplazamiento en Z (profundidad: positivo=cerca, negativo=lejos).
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas trasladadas.
   */
  translacion(coords, tx, ty, tz) {
    if (coords.length === 0) {
      return [];
    }

    const resultado = [];

    // Recorremos de 3 en 3 leyendo [X, Y, Z]
    for (let i = 0; i < coords.length; i += 3) {
      const x = coords[i];
      const y = coords[i + 1];
      const z = coords[i + 2];

      // Sumamos los desplazamientos a cada eje
      resultado.push(x + tx, y + ty, z + tz);
    }

    return resultado;
  }

  /**
   * Rota las coordenadas alrededor del eje X para "acostar" o "levantar" la figura.
   *
   * @param {Array<number>} coords Arreglo plano de coordenadas [X, Y, Z...].
   * @param {number} angulo Angulo de rotación en radianes.
   *
   * @returns {Array<number>} Nuevo arreglo de coordenadas rotadas en X.
   */
  rotacionX(coords, angulo) {
    if (coords.length === 0) {
      return [];
    }

    const cos = Math.cos(angulo);
    const sin = Math.sin(angulo);
    const resultado = [];

    // Recorremos de 3 en 3 leyendo [X, Y, Z]
    for (let i = 0; i < coords.length; i += 3) {
      const x = coords[i];
      const y = coords[i + 1];
      const z = coords[i + 2];

      // En la rotación X, el eje X se queda intacto.
      // Modificamos Y (altura) y Z (profundidad) para "acostar" los puntos.
      const nuevoY = y * cos - z * sin;
      const nuevoZ = y * sin + z * cos;

      resultado.push(x, nuevoY, nuevoZ);
    }

    return resultado;
  }
}