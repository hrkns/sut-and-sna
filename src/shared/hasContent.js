import _ from "lodash";

/**
 * Checks whether a value is considered present in table cells.
 *
 * `null`, `undefined`, and empty string are treated as missing values.
 *
 * @param {any} val
 * @returns {boolean}
 */
const hasContent = (val) => {
  return !_.isNil(val) && val !== "";
};

export default hasContent;
