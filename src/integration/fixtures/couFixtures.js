/**
 * Builds default branch metadata used by `appValues.branches`.
 *
 * @param {number} [branchCount=3]
 * @returns {{ name: string }[]}
 */
const createBranchesFixture = (branchCount = 3) => {
  return Array.from({ length: branchCount }, (_, idx) => ({
    name: `Rama ${idx + 1}`,
  }));
};

/**
 * Creates an object with branchN keys (`branch1`, `branch2`, ...).
 *
 * @param {number} branchCount
 * @param {any} [fillValue=null]
 * @returns {Record<string, any>}
 */
const createBranchColumns = (branchCount, fillValue = null) => {
  const branchColumns = {};
  for (let idx = 1; idx <= branchCount; idx++) {
    branchColumns[`branch${idx}`] = fillValue;
  }
  return branchColumns;
};

/**
 * Creates the shape used by COU branch-like rows.
 *
 * @param {number} [branchCount=3]
 * @param {any} [fillValue=null]
 * @returns {{
 *   intermediateUse: Record<string, any> & { gov: any, st: any },
 *   finalUse: { gcfHomes: any, gcfGov: any, fbkFbkf: any, fbkVe: any, exports: any, st: any },
 *   total: any
 * }}
 */
const createCouBranchRowFixture = (branchCount = 3, fillValue = null) => {
  return {
    intermediateUse: {
      ...createBranchColumns(branchCount, fillValue),
      gov: fillValue,
      st: fillValue,
    },
    finalUse: {
      gcfHomes: fillValue,
      gcfGov: fillValue,
      fbkFbkf: fillValue,
      fbkVe: fillValue,
      exports: fillValue,
      st: fillValue,
    },
    total: fillValue,
  };
};

/**
 * Deep clones JSON-serializable fixture data.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
const clone = (value) => JSON.parse(JSON.stringify(value));

/**
 * Sets a value at a dot-separated path, creating intermediate objects.
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @param {any} value
 * @returns {void}
 */
const setAtPath = (obj, path, value) => {
  const parts = path.split(".");
  let current = obj;
  for (let idx = 0; idx < parts.length - 1; idx++) {
    const key = parts[idx];
    if (
      !Object.prototype.hasOwnProperty.call(current, key) ||
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
};

/**
 * Creates an empty COU object matching the app's expected structure.
 *
 * @param {number} [branchCount=3]
 * @param {any} [fillValue=null]
 * @returns {Record<string, any>}
 */
const createEmptyCouFixture = (branchCount = 3, fillValue = null) => {
  const branchRow = createCouBranchRowFixture(branchCount, fillValue);
  const intermediateOnly = {
    intermediateUse: clone(branchRow.intermediateUse),
  };
  const cou = {};

  for (let idx = 1; idx <= branchCount; idx++) {
    cou[`branch${idx}`] = clone(branchRow);
  }

  cou.gov = clone(branchRow);
  cou.imports = clone(branchRow);
  cou.totalUses = clone(branchRow);
  cou.ra = clone(intermediateOnly);
  cou.ckf = clone(intermediateOnly);
  cou.tax = clone(intermediateOnly);
  cou.een = clone(intermediateOnly);
  cou.vab = clone(intermediateOnly);
  cou.production = clone(intermediateOnly);

  return cou;
};

/**
 * Creates a COU fixture and applies path-based overrides.
 *
 * Example path: `branch1.intermediateUse.branch2`
 *
 * @param {{
 *   branchCount?: number,
 *   fillValue?: any,
 *   valuesByPath?: Record<string, any>
 * }} [options]
 * @returns {Record<string, any>}
 */
const createCouFixture = ({
  branchCount = 3,
  fillValue = null,
  valuesByPath = {},
} = {}) => {
  const cou = createEmptyCouFixture(branchCount, fillValue);
  Object.entries(valuesByPath).forEach(([path, value]) => {
    setAtPath(cou, path, value);
  });
  return cou;
};

/**
 * Creates `appValues` fixture data and optionally embeds a COU fixture.
 *
 * @param {{
 *   branchCount?: number,
 *   includeCou?: boolean,
 *   couValuesByPath?: Record<string, any>
 * }} [options]
 * @returns {{ branches: { name: string }[], cou?: Record<string, any> }}
 */
const createAppValuesFixture = ({
  branchCount = 3,
  includeCou = false,
  couValuesByPath = {},
} = {}) => {
  const appValues = {
    branches: createBranchesFixture(branchCount),
  };

  if (includeCou) {
    appValues.cou = createCouFixture({
      branchCount,
      valuesByPath: couValuesByPath,
    });
  }

  return appValues;
};

export {
  createAppValuesFixture,
  createBranchesFixture,
  createCouBranchRowFixture,
  createCouFixture,
  createEmptyCouFixture,
};
