import _ from "lodash";
import hasContent from "./hasContent";

/**
 * Decides whether a computed value should be written into the table.
 *
 * When `val` has content and differs from the current value at `path`, the
 * function mutates `table` at `path` and returns `true`.
 *
 * @param {Record<string, any>} table
 * @param {any} val
 * @param {string} path
 * @returns {boolean}
 */
const shouldCompute = (table, val, path) => {
  let cond = false;

  if (hasContent(val)) {
    cond = val !== _.get(table, path);
    // Modify value in table only if it's detected that the value has changed.
    if (cond) {
      console.log(
        `Setting Table at ${path} with ${val}. Previous value: ${_.get(
          table,
          path
        )}`
      );
      _.set(table, path, val);
    } else {
      console.log(
        `Value at ${path} has not changed. Previous value: ${_.get(
          table,
          path
        )}`
      );
    }
  }

  return cond;
};

export default shouldCompute;
