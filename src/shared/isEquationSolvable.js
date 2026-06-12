import _ from "lodash";
import hasContent from "./hasContent";

/**
 * Determines whether an equation has exactly one unknown value (`x`).
 *
 * @param {string[]} equationElements
 * @param {Record<string, any>} values
 * @returns {boolean}
 */
const isEquationSolvable = (equationElements, values) => {
  let amountOfDefinedValues = 0;
  let amountOfTotalValues = 0;
  equationElements.forEach((element) => {
    if (element === "=" || element === "+" || element === "-") return;
    amountOfTotalValues++;
    if (element !== "x" && hasContent(_.get(values, element)))
      amountOfDefinedValues++;
  });
  return amountOfDefinedValues === amountOfTotalValues - 1;
};

export default isEquationSolvable;
