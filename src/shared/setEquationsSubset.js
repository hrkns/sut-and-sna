/**
 * Appends equation variants for all branch columns plus `gov` and `total`.
 *
 * @param {number[]} branchesIndexes
 * @param {Record<string, string[][]>} equations
 * @param {string} row
 * @param {string} side
 * @param {(row: string, col: string, side: string) => string[] | null | undefined} equationBuilder
 * @returns {void}
 */
const setEquationsSubset = (
  branchesIndexes,
  equations,
  row,
  side,
  equationBuilder
) => {
  branchesIndexes.forEach((xBranch) => {
    equations[`${row}.${side}.branch${xBranch}`] =
      equations[`${row}.${side}.branch${xBranch}`] || [];
    equations[`${row}.${side}.branch${xBranch}`].push(
      equationBuilder(row, `branch${xBranch}`, side)
    );
  });
  equations[`${row}.${side}.gov`] = equations[`${row}.${side}.gov`] || [];
  let equation = equationBuilder(row, "gov", side);
  if (equation) equations[`${row}.${side}.gov`].push(equation);
  equations[`${row}.${side}.total`] = equations[`${row}.${side}.total`] || [];
  equation = equationBuilder(row, "total", side);
  if (equation) equations[`${row}.${side}.total`].push(equation);
};

export default setEquationsSubset;
