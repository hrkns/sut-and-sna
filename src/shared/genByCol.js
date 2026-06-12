/**
 * Generates an equation token for column-based equations.
 *
 * Returns `x` when the current column is the variable being solved, otherwise
 * returns the value path for `currentCol`.
 *
 * @param {string} row
 * @param {string} side
 * @param {string | null} col
 * @param {string} currentCol
 * @returns {string}
 */
const genByCol = (row, side, col, currentCol) => {
  return col === currentCol ? "x" : `${row}.${side}.${currentCol}`;
};

export default genByCol;
