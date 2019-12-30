/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
export function frob(a) {
  return Math.sqrt(
    Math.pow(a[0], 2) +
      Math.pow(a[1], 2) +
      Math.pow(a[2], 2) +
      Math.pow(a[3], 2) +
      Math.pow(a[4], 2) +
      Math.pow(a[5], 2) +
      1
  );
}
