import _ from "lodash";
import hasContent from "./hasContent";
import surround from "./surround";

/**
 * Builds algebra.js-ready strings for each side of an equation token list.
 *
 * Supported operators and symbols (`x`, `+`, `-`, `=`) are copied as-is.
 * Path-like tokens are resolved against `values` and wrapped in parentheses.
 *
 * @param {string[]} equationElements
 * @param {Record<string, any>} values
 * @returns {{ leftSide: string, rightSide: string }}
 */
const buildEquationSides = (equationElements, values) => {
  let leftSide = "";
  let rightSide = "";
  let switchToRightSide = false;

  equationElements.forEach((element) => {
    let content;
    switch (element) {
      case "x":
        content = element;
        break;
      case "+":
        content = element;
        break;
      case "-":
        content = element;
        break;
      case "=":
        switchToRightSide = true;
        break;
      default:
        let val = _.get(values, element);
        if (hasContent(val)) {
          content = surround(_.toString(val));
        }
    }

    if (hasContent(content)) {
      if (switchToRightSide) {
        rightSide += content;
      } else {
        leftSide += content;
      }
    }
  });

  return { leftSide, rightSide };
};

export default buildEquationSides;
