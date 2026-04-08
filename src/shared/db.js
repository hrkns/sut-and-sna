/**
 * Reads a persisted value from localStorage using the app namespace.
 *
 * @param {string} key
 * @returns {any | null}
 */
const getItem = (key) => {
  let storedCouValues = localStorage.getItem("couApp_" + key);
  if (storedCouValues) {
    storedCouValues = JSON.parse(storedCouValues);
  }
  return storedCouValues;
};

/**
 * Stores a value in localStorage using the app namespace.
 *
 * @param {string} key
 * @param {any} val
 * @returns {void}
 */
const setItem = (key, val) => {
  localStorage.setItem("couApp_" + key, JSON.stringify(val));
};

export { getItem, setItem };
