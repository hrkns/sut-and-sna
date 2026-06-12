/**
 * Generates an equation token for row-based equations.
 *
 * Returns `x` when the current row is the variable being solved and, if
 * provided, `varSide` matches the current `side`.
 *
 * @param {string} row
 * @param {string} side
 * @param {string | null} col
 * @param {string} currentRow
 * @param {string} [varSide]
 * @returns {string}
 */
const genByRow = (row, side, col, currentRow, varSide) => {
  return row === currentRow && (!varSide || varSide === side)
    ? "x"
    : `${currentRow}.${side}.${col}`;
};

export default genByRow;
