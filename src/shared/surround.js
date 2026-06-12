// It's required to surround values with parenthesis for the algebra.js library to work.
// It breaks when the values are negative and they are not surrounded.

/**
 * Wraps a value in parentheses so algebra.js parses signed values safely.
 *
 * @param {string | number} val
 * @returns {string}
 */
const surround = (val) => {
  return "(" + val + ")";
};

export default surround;
