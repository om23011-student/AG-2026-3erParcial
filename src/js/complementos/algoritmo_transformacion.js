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

    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];

      const nuevoX = matriz[0][0] * x + matriz[0][1] * y;
      const nuevoY = matriz[1][0] * x + matriz[1][1] * y;

      resultado.push(nuevoX, nuevoY);
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
}